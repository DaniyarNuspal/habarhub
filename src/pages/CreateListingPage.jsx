import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LogoMark from '../components/LogoMark';
import { categories } from '../data/listings';
import { translations } from '../i18n/translations';
import { getUserId } from '../utils/user';
import { supabase } from '../supabase';

const initialForm = {
  title: '',
  category: 'housing',
  description: '',
  location: '',
  price: '',
  phone: '',
  whatsapp: '',
  image: '',
  images: [],
  tags: []
};

function formatKazakhPhone(value) {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  let normalized = digits;
  if (normalized.startsWith('8')) {
    normalized = `7${normalized.slice(1)}`;
  } else if (!normalized.startsWith('7')) {
    normalized = `7${normalized}`;
  }

  normalized = normalized.slice(0, 11);

  const country = normalized.slice(0, 1);
  const part1 = normalized.slice(1, 4);
  const part2 = normalized.slice(4, 7);
  const part3 = normalized.slice(7, 9);
  const part4 = normalized.slice(9, 11);

  return [`+${country}`, part1, part2, part3, part4].filter(Boolean).join(' ').trim();
}

export default function CreateListingPage({
  currentUserId,
  language,
  listings,
  onCreateListing,
  onLanguageChange,
  onUpdateListing
}) {
  const [formValues, setFormValues] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const editingListing = useMemo(
    () =>
      id
        ? listings.find(
            (item) =>
              String(item.id) === String(id) && String(item.userId) === String(currentUserId)
          )
        : null,
    [currentUserId, id, listings]
  );
  const isEditing = Boolean(editingListing);
  const t = translations[language];

  useEffect(() => {
    document.title = 'HabarHub - 哈百通';
  }, []);

  useEffect(() => {
    if (id && !editingListing) {
      navigate('/my-listings', { replace: true });
    }
  }, [editingListing, id, navigate]);

  useEffect(() => {
    if (!isEditing || !editingListing) {
      setFormValues(initialForm);
      setTagInput('');
      setErrors({});
      return;
    }

    setFormValues({
      title: editingListing.title?.zh || editingListing.title?.en || '',
      category: editingListing.category || 'housing',
      description: editingListing.description?.zh || editingListing.description?.en || '',
      location: editingListing.location || '',
      price: String(editingListing.price ?? ''),
      phone: editingListing.phone || '',
      whatsapp: editingListing.whatsapp || '',
      image: editingListing.image || '',
      images: Array.isArray(editingListing.images) && editingListing.images.length > 0
        ? editingListing.images
        : editingListing.image
          ? [editingListing.image]
          : [],
      tags: Array.isArray(editingListing.tags)
        ? editingListing.tags.filter((tag) => tag !== '新发布')
        : []
    });
    setTagInput('');
    setErrors({});
  }, [editingListing, isEditing]);

  function handleChange(event) {
    const { name } = event.target;
    const value =
      name === 'phone' || name === 'whatsapp'
        ? formatKazakhPhone(event.target.value)
        : event.target.value;

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
    setErrors((currentErrors) => {
      const nextErrors = {
        ...currentErrors,
        [name]: ''
      };

      if (name === 'phone' || name === 'whatsapp') {
        nextErrors.phone = '';
        nextErrors.whatsapp = '';
      }

      return nextErrors;
    });
  }

  async function handleImageChange(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    const existingCount = formValues.images.length;
    const remainingSlots = Math.max(0, 6 - existingCount);

    if (files.length > remainingSlots) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        images: t.imageLimit
      }));
    } else {
      setErrors((currentErrors) => ({
        ...currentErrors,
        images: ''
      }));
    }

    const filesToUpload = files.slice(0, remainingSlots);
    const uploadResults = await Promise.allSettled(
      filesToUpload.map(async (file, index) => {
        const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
        const fileName = `${Date.now()}-${index}-${crypto.randomUUID()}.${fileExtension}`;

        const { error } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file);

        if (error) {
          throw error;
        }

        const { data: publicUrlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
      })
    );

    const uploadedImages = uploadResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);
    const failedUploads = uploadResults.some((result) => result.status === 'rejected');

    if (uploadedImages.length > 0) {
      setFormValues((currentValues) => {
        const nextImages = [...currentValues.images, ...uploadedImages].slice(0, 6);
        return {
          ...currentValues,
          images: nextImages,
          image: nextImages[0] || ''
        };
      });
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      images: failedUploads ? t.imageUploadFailed : ''
    }));

    event.target.value = '';
  }

  function handleRemoveImage(indexToRemove) {
    setFormValues((currentValues) => {
      const nextImages = currentValues.images.filter((_, index) => index !== indexToRemove);
      return {
        ...currentValues,
        images: nextImages,
        image: nextImages[0] || ''
      };
    });
    setErrors((currentErrors) => ({
      ...currentErrors,
      images: ''
    }));
  }

  function handleSetCover(indexToMove) {
    setFormValues((currentValues) => {
      if (indexToMove === 0) {
        return currentValues;
      }

      const nextImages = [...currentValues.images];
      const [selectedImage] = nextImages.splice(indexToMove, 1);
      nextImages.unshift(selectedImage);

      return {
        ...currentValues,
        images: nextImages,
        image: nextImages[0] || ''
      };
    });
  }

  function addTag() {
    const nextTag = tagInput.trim();
    if (!nextTag) {
      return;
    }

    if (formValues.tags.length >= 6) {
      return;
    }

    if (formValues.tags.includes(nextTag)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        tags: t.duplicateTag
      }));
      return;
    }

    setFormValues((currentValues) => {
      return {
        ...currentValues,
        tags: [...currentValues.tags, nextTag]
      };
    });
    setTagInput('');
    setErrors((currentErrors) => ({
      ...currentErrors,
      tags: ''
    }));
  }

  function handleTagKeyDown(event) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    addTag();
  }

  function removeTag(tagToRemove) {
    setFormValues((currentValues) => ({
      ...currentValues,
      tags: currentValues.tags.filter((tag) => tag !== tagToRemove)
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      tags: ''
    }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!formValues.title.trim()) {
      nextErrors.title = t.errorRequiredTitle;
    }

    if (!formValues.category.trim()) {
      nextErrors.category = t.errorRequiredCategory;
    }

    if (!formValues.description.trim()) {
      nextErrors.description = t.errorRequiredDescription;
    }

    if (!formValues.location.trim()) {
      nextErrors.location = t.errorRequiredLocation;
    }

    if (!formValues.phone.trim() && !formValues.whatsapp.trim()) {
      nextErrors.phone = t.errorRequiredContact;
      nextErrors.whatsapp = t.errorRequiredContact;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    if (isEditing && editingListing) {
      if (editingListing.userId !== getUserId()) {
        window.alert('无权限');
        setIsSubmitting(false);
        return;
      }

      const updated = await onUpdateListing(editingListing.id, {
        ...formValues,
        image: formValues.images[0] || formValues.image || ''
      });
      if (!updated) {
        setIsSubmitting(false);
        return;
      }

      setToastMessage(t.updateSuccess);

      window.setTimeout(() => {
        navigate('/my-listings', {
          state: {
            toast: t.updateSuccess
          }
        });
      }, 900);
      return;
    }

    const created = await onCreateListing({
      ...formValues,
      images: Array.isArray(formValues.images) ? formValues.images.filter(Boolean) : [],
      image: formValues.images[0] || formValues.image || ''
    });
    if (!created) {
      setIsSubmitting(false);
      return;
    }

    setToastMessage(t.publishSuccess);

    window.setTimeout(() => {
      navigate('/', {
        state: {
          toast: t.publishSuccess
        }
      });
    }, 900);
  }

  const categoryOptions = categories.filter((category) => category.id !== 'all');
  const remainingTags = Math.max(0, 6 - formValues.tags.length);
  const tagsRemainingText = t.tagsRemaining.replace('{count}', String(remainingTags));

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-100 pb-8">
      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-30 mx-auto flex max-w-md justify-center px-4">
          <div className="rounded-full bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white shadow-soft">
            {toastMessage}
          </div>
        </div>
      ) : null}

      <main className="px-4 pt-5">
        <section className="rounded-[32px] bg-hero px-5 pb-6 pt-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Link
                to="/"
                className="inline-flex rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-900 backdrop-blur"
              >
                ← {t.backHome}
              </Link>
              <div className="mt-4">
                <LogoMark />
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                {isEditing ? t.editTitle : t.createTitle}
              </h1>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                {isEditing ? t.editSubtitle : t.createSubtitle}
              </p>
            </div>
            <LanguageSwitcher current={language} onChange={onLanguageChange} />
          </div>
        </section>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormField label={t.titleField} error={errors.title} requiredMark={t.requiredMark}>
            <input
              name="title"
              value={formValues.title}
              onChange={handleChange}
              placeholder={t.titlePlaceholder}
              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#16A34A] focus:bg-white ${
                errors.title ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
          </FormField>

          <FormField label={t.categoryField} error={errors.category} requiredMark={t.requiredMark}>
            <select
              name="category"
              value={formValues.category}
              onChange={handleChange}
              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#16A34A] focus:bg-white ${
                errors.category ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {t[category.id]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={t.imageField} hint={t.imageHint} error={errors.images}>
            <div className="space-y-2">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-[#16A34A] bg-[#16A34A]/10 px-4 py-6 text-center">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#16A34A] shadow-soft">
                  {t.imageSelect}
                </span>
                <input
                  accept="image/*"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                {formValues.images.length > 0 ? (
                  <div className="mt-4 grid w-full grid-cols-3 gap-2">
                    {formValues.images.map((image, index) => (
                      <div key={`${image}-${index}`} className="relative overflow-hidden rounded-[18px]">
                        <img
                          src={image}
                          alt={`${t.imagePreviewAlt} ${index + 1}`}
                          className="aspect-square w-full cursor-pointer object-cover"
                          onClick={(event) => {
                            event.preventDefault();
                            handleSetCover(index);
                          }}
                        />
                        {index === 0 ? (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-[#16A34A] px-2 py-1 text-[10px] font-bold text-white">
                            {t.coverBadge}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              handleSetCover(index);
                            }}
                            className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#16A34A]"
                          >
                            {t.setCover}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            handleRemoveImage(index);
                          }}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white"
                          aria-label={t.removeImage}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </label>
              <p className="px-1 text-xs leading-5 text-slate-400">{t.imagePrivacyHint}</p>
            </div>
          </FormField>

          <FormField
            label={t.descriptionField}
            error={errors.description}
            requiredMark={t.requiredMark}
          >
            <textarea
              name="description"
              value={formValues.description}
              onChange={handleChange}
              placeholder={t.descriptionPlaceholder}
              rows={5}
              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#16A34A] focus:bg-white ${
                errors.description ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
          </FormField>

          <FormField
            label={t.locationField}
            error={errors.location}
            requiredMark={t.requiredMark}
          >
            <input
              name="location"
              value={formValues.location}
              onChange={handleChange}
              placeholder={t.locationPlaceholder}
              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#16A34A] focus:bg-white ${
                errors.location ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
          </FormField>

          <FormField
            label={t.tagsField}
            hint={`${t.tagsHint} · ${tagsRemainingText}`}
            error={errors.tags}
          >
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(event) => {
                  setTagInput(event.target.value);
                  setErrors((currentErrors) => ({
                    ...currentErrors,
                    tags: ''
                  }));
                }}
                onKeyDown={handleTagKeyDown}
                placeholder={t.tagPlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#16A34A] focus:bg-white"
              />
              <button
                type="button"
                onClick={addTag}
                className="shrink-0 rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15803D]"
              >
                {t.addTag}
              </button>
            </div>
            {formValues.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {formValues.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    <span className="max-w-32 truncate">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400"
                      aria-label={t.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </FormField>

          <FormField label={t.priceField}>
            <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-[#16A34A] focus-within:bg-white">
              <input
                min="0"
                step="1"
                type="number"
                name="price"
                value={formValues.price}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
              />
              <span className="text-sm font-bold text-[#16A34A]">₸</span>
            </div>
          </FormField>

          <FormField label={t.phoneField} error={errors.phone} requiredMark={t.requiredMark}>
            <input
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
              placeholder={t.phonePlaceholder}
              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#16A34A] focus:bg-white ${
                errors.phone ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
          </FormField>

          <FormField label={t.whatsappField} error={errors.whatsapp} requiredMark={t.requiredMark}>
            <input
              name="whatsapp"
              value={formValues.whatsapp}
              onChange={handleChange}
              placeholder={t.whatsappPlaceholder}
              className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#16A34A] focus:bg-white ${
                errors.whatsapp ? 'border-rose-300' : 'border-slate-200'
              }`}
            />
          </FormField>

          <div className="rounded-[28px] bg-white p-5 shadow-soft">
            <p className="text-sm leading-6 text-slate-500">{t.createHint}</p>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 w-full rounded-2xl px-4 py-4 text-sm font-semibold text-white shadow-soft ${
                isSubmitting ? 'bg-[#15803D]' : 'bg-[#16A34A]'
              }`}
            >
              {isSubmitting ? t.loading : isEditing ? t.updateSubmit : t.submit}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function FormField({ label, hint, error, children, requiredMark }) {
  return (
    <label className="block rounded-[28px] bg-white p-5 shadow-soft">
      <div className="mb-3">
        <span className="block text-sm font-semibold text-slate-700">
          {label}
          {requiredMark ? <span className="ml-1 text-rose-500">{requiredMark}</span> : null}
        </span>
        {hint ? <span className="mt-1 block text-xs leading-5 text-slate-400">{hint}</span> : null}
        {error ? <span className="mt-1 block text-xs font-semibold text-rose-500">{error}</span> : null}
      </div>
      {children}
    </label>
  );
}
