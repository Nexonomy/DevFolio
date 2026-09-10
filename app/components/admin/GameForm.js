'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { slugify } from '@/lib/slug';
import { getBlobDeliveryUrl } from '@/lib/blob';

const emptyVideo = () => ({ youtubeUrl: '', title: '' });

function mapGameToForm(game) {
  return {
    title: game?.title || '',
    slug: game?.slug || '',
    description: game?.description || '',
    tag: game?.tag || '',
    tech: game?.tech || '',
    year: game?.year || '',
    emoji: game?.emoji || '',
    bgColor: game?.bgColor || '#4A7C2F',
    coverImageUrl: game?.coverImageUrl || '',
    published: game?.published ?? false,
    sortOrder: game?.sortOrder ?? 0,
    screenshots: game?.screenshots?.map((item) => ({
      url: item.url,
      alt: item.alt || '',
    })) || [],
    videos: game?.videos?.length
      ? game.videos.map((item) => ({ youtubeUrl: item.youtubeUrl, title: item.title || '' }))
      : [emptyVideo()],
  };
}

export default function GameForm({ game }) {
  const router = useRouter();
  const isEditing = Boolean(game?.id);
  const [form, setForm] = useState(() => mapGameToForm(game));
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'title' && !slugEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const uploadFile = async (file) => {
    const body = new FormData();
    body.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const url = await uploadFile(file);
      updateField('coverImageUrl', url);
    } catch {
      setError('Failed to upload cover image');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleScreenshotUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError('');

    try {
      const urls = await Promise.all(files.map((file) => uploadFile(file)));
      setForm((current) => ({
        ...current,
        screenshots: [
          ...current.screenshots,
          ...urls.map((url) => ({ url, alt: '' })),
        ],
      }));
    } catch {
      setError('Failed to upload screenshots');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const moveScreenshot = (index, direction) => {
    setForm((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.screenshots.length) {
        return current;
      }

      const screenshots = [...current.screenshots];
      [screenshots[index], screenshots[nextIndex]] = [screenshots[nextIndex], screenshots[index]];
      return { ...current, screenshots };
    });
  };

  const removeScreenshot = (index) => {
    setForm((current) => ({
      ...current,
      screenshots: current.screenshots.filter((_, i) => i !== index),
    }));
  };

  const updateScreenshotAlt = (index, alt) => {
    setForm((current) => ({
      ...current,
      screenshots: current.screenshots.map((item, i) => (i === index ? { ...item, alt } : item)),
    }));
  };

  const updateVideo = (index, field, value) => {
    setForm((current) => ({
      ...current,
      videos: current.videos.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addVideo = () => {
    setForm((current) => ({
      ...current,
      videos: [...current.videos, emptyVideo()],
    }));
  };

  const removeVideo = (index) => {
    setForm((current) => ({
      ...current,
      videos: current.videos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...form,
      videos: form.videos.filter((video) => video.youtubeUrl.trim()),
    };

    const response = await fetch(isEditing ? `/api/games/${game.id}` : '/api/games', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || 'Failed to save game');
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <form className="admin-form admin-game-form" onSubmit={handleSubmit}>
      <div className="admin-form-header">
        <h1 className="admin-title">{isEditing ? 'Edit Game' : 'New Game Project'}</h1>
        <p className="admin-subtitle">Manage project details, media, and publish status.</p>
      </div>

      <div className="admin-form-grid">
        <label className="admin-label">
          Title *
          <input
            className="admin-input"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />
        </label>

        <label className="admin-label">
          Slug *
          <input
            className="admin-input"
            value={form.slug}
            onChange={(event) => {
              setSlugEdited(true);
              updateField('slug', event.target.value);
            }}
            required
          />
        </label>

        <label className="admin-label">
          Genre Tag *
          <input
            className="admin-input"
            value={form.tag}
            onChange={(event) => updateField('tag', event.target.value)}
            placeholder="PLATFORMER"
            required
          />
        </label>

        <label className="admin-label">
          Tech Stack *
          <input
            className="admin-input"
            value={form.tech}
            onChange={(event) => updateField('tech', event.target.value)}
            placeholder="Unity · C# · Pixel Art"
            required
          />
        </label>

        <label className="admin-label">
          Year
          <input
            className="admin-input"
            value={form.year}
            onChange={(event) => updateField('year', event.target.value)}
            placeholder="2025"
          />
        </label>

        <label className="admin-label">
          Sort Order
          <input
            className="admin-input"
            type="number"
            value={form.sortOrder}
            onChange={(event) => updateField('sortOrder', event.target.value)}
          />
        </label>

        <label className="admin-label admin-label-full">
          Description *
          <textarea
            className="admin-textarea"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={5}
            required
          />
        </label>

        <label className="admin-label">
          Emoji Fallback
          <input
            className="admin-input"
            value={form.emoji}
            onChange={(event) => updateField('emoji', event.target.value)}
            placeholder="🏃"
          />
        </label>

        <label className="admin-label">
          Background Color
          <input
            className="admin-input admin-color-input"
            type="color"
            value={form.bgColor}
            onChange={(event) => updateField('bgColor', event.target.value)}
          />
        </label>

        <label className="admin-label admin-checkbox-label">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) => updateField('published', event.target.checked)}
          />
          Published (visible on homepage)
        </label>
      </div>

      <section className="admin-section">
        <h2 className="admin-section-title">Cover Image</h2>
        <div className="admin-upload-row">
          <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
          {form.coverImageUrl && (
            <div className="admin-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getBlobDeliveryUrl(form.coverImageUrl)} alt="Cover preview" />
              <button
                type="button"
                className="admin-button admin-button-small admin-button-danger"
                onClick={() => updateField('coverImageUrl', '')}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Screenshots</h2>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleScreenshotUpload}
          disabled={uploading}
        />
        {uploading && <p className="admin-hint">Uploading...</p>}

        <div className="admin-screenshot-grid">
          {form.screenshots.map((screenshot, index) => (
            <div key={`${screenshot.url}-${index}`} className="admin-screenshot-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getBlobDeliveryUrl(screenshot.url)} alt={screenshot.alt || `Screenshot ${index + 1}`} />
              <input
                className="admin-input"
                value={screenshot.alt}
                onChange={(event) => updateScreenshotAlt(index, event.target.value)}
                placeholder="Alt text"
              />
              <div className="admin-screenshot-actions">
                <button type="button" className="admin-button admin-button-small" onClick={() => moveScreenshot(index, -1)}>
                  ↑
                </button>
                <button type="button" className="admin-button admin-button-small" onClick={() => moveScreenshot(index, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className="admin-button admin-button-small admin-button-danger"
                  onClick={() => removeScreenshot(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">YouTube Videos</h2>
          <button type="button" className="admin-button admin-button-small" onClick={addVideo}>
            Add Video
          </button>
        </div>

        {form.videos.map((video, index) => (
          <div key={index} className="admin-video-row">
            <input
              className="admin-input"
              value={video.youtubeUrl}
              onChange={(event) => updateVideo(index, 'youtubeUrl', event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <input
              className="admin-input"
              value={video.title}
              onChange={(event) => updateVideo(index, 'title', event.target.value)}
              placeholder="Video title (optional)"
            />
            {form.videos.length > 1 && (
              <button
                type="button"
                className="admin-button admin-button-small admin-button-danger"
                onClick={() => removeVideo(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </section>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-form-actions">
        <button type="button" className="admin-button" onClick={() => router.push('/admin')}>
          Cancel
        </button>
        <button type="submit" className="admin-button admin-button-primary" disabled={loading || uploading}>
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Game'}
        </button>
      </div>
    </form>
  );
}
