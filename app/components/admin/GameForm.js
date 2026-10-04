'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { slugify } from '@/lib/slug';
import { getBlobDeliveryUrl } from '@/lib/blob';
import { GAME_GENRES } from '@/lib/games';

const emptyVideo = () => ({ youtubeUrl: '', title: '' });
const joinLines = (value) => (Array.isArray(value) ? value.join('\n') : value || '');
const CUSTOM_GENRE = '__custom__';

function mapGameToForm(game) {
  return {
    title: game?.title || '',
    slug: game?.slug || '',
    description: game?.description || '',
    tag: game?.tag || '',
    categories: game?.categories?.join(', ') || game?.tag || '',
    tech: game?.tech || '',
    year: game?.year || '',
    emoji: game?.emoji || '',
    bgColor: game?.bgColor || '#4A7C2F',
    coverImageUrl: game?.coverImageUrl || '',
    published: game?.published ?? false,
    sortOrder: game?.sortOrder ?? 0,
    portfolioSection: game?.portfolioSection || 'GAME',
    projectContext: game?.projectContext || 'PERSONAL',
    role: game?.role || '',
    contribution: game?.contribution || '',
    contributions: joinLines(game?.contributions),
    team: joinLines(game?.team),
    recognition: game?.recognition || '',
    features: joinLines(game?.features),
    highlights: joinLines(game?.highlights),
    platforms: game?.platforms || '',
    liveUrl: game?.liveUrl || '',
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
  const [tab, setTab] = useState('basics');
  const [savedSnapshot] = useState(() => JSON.stringify(mapGameToForm(game)));
  const dirty = JSON.stringify(form) !== savedSnapshot;
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!dirty || leaving) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, leaving]);

  const [customGenre, setCustomGenre] = useState(() => Boolean(game?.tag) && !GAME_GENRES.some((genre) => genre.toLowerCase() === game.tag.toLowerCase()));

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
    const required = [['title', 'Title'], ['slug', 'Slug'], ['description', 'Description'], ['tag', 'Genre'], ['tech', 'Tech stack']]
      .filter(([field]) => !String(form[field] ?? '').trim())
      .map(([, label]) => label);
    if (required.length) {
      setTab('basics');
      setError(`Please fill in: ${required.join(', ')}.`);
      return;
    }
    if (form.liveUrl && !/^https:\/\//i.test(form.liveUrl)) {
      setTab('case');
      setError('The live link must start with https://');
      return;
    }
    setLoading(true);
    setError('');

    const payload = {
      ...form,
      categories: form.categories.split(',').map((category) => category.trim()).filter(Boolean),
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

    setLeaving(true);
    router.push('/admin');
    router.refresh();
  };

  return (
    <form className="admin-form admin-game-form" onSubmit={handleSubmit} noValidate>
      <div className="admin-form-header">
        <h1 className="admin-title">{isEditing ? form.title || 'Edit project' : 'New project'}</h1>
        <p className="admin-subtitle">Fill in the basics, then add the case study and media. Only the basics are required.</p>
      </div>

      <nav className="admin-profile-tabs" role="tablist" aria-label="Project sections">
        {[['basics', 'Basics'], ['case', 'Case study'], ['media', 'Cover & media']].map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} className={tab === value ? 'is-active' : undefined} onClick={() => setTab(value)}>
            {label}
            {value === 'media' && <span>{(form.coverImageUrl ? 1 : 0) + form.screenshots.length + form.videos.filter((video) => video.youtubeUrl.trim()).length}</span>}
          </button>
        ))}
      </nav>

      {tab === 'basics' && (
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
          Portfolio Section *
          <select className="admin-input" value={form.portfolioSection} onChange={(event) => updateField('portfolioSection', event.target.value)} required>
            <option value="GAME">Game development portfolio</option>
            <option value="OTHER">Additional projects</option>
          </select>
        </label>

        <label className="admin-label">
          Project Context *
          <select className="admin-input" value={form.projectContext} onChange={(event) => updateField('projectContext', event.target.value)} required>
            <option value="PERSONAL">Personal project</option>
            <option value="COMPANY">Company project</option>
            <option value="ACADEMIC">Academic project</option>
            <option value="HACKATHON">Hackathon</option>
          </select>
        </label>

        {form.portfolioSection === 'GAME' ? (
          <label className="admin-label">
            Genre *
            <select
              className="admin-input"
              value={customGenre ? CUSTOM_GENRE : (GAME_GENRES.find((genre) => genre.toLowerCase() === form.tag.toLowerCase()) || '')}
              onChange={(event) => {
                if (event.target.value === CUSTOM_GENRE) { setCustomGenre(true); return; }
                setCustomGenre(false);
                updateField('tag', event.target.value);
              }}
              required={!customGenre}
            >
              <option value="" disabled>Choose a genre…</option>
              {GAME_GENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
              <option value={CUSTOM_GENRE}>Custom…</option>
            </select>
            {customGenre && (
              <input
                className="admin-input"
                style={{ marginTop: '8px' }}
                value={form.tag}
                onChange={(event) => updateField('tag', event.target.value)}
                placeholder="Type a custom genre"
                required
              />
            )}
            <small className="admin-field-help">Genres become the filter buttons on the site. Picking from the list keeps filters consistent across projects.</small>
          </label>
        ) : (
          <label className="admin-label">
            Project type / discipline *
            <input
              className="admin-input"
              value={form.tag}
              onChange={(event) => updateField('tag', event.target.value)}
              placeholder="Short film, Web app, Motion design…"
              required
            />
            <small className="admin-field-help">This value appears in the public filter navigation.</small>
          </label>
        )}

        <label className="admin-label">
          Project Categories
          <input
            className="admin-input"
            value={form.categories}
            onChange={(event) => updateField('categories', event.target.value)}
            placeholder="2D, Platformer, Puzzle..."
          />
          <small className="admin-field-help">Separate descriptive labels with commas. These appear on the project card and case study.</small>
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
      )}

      {tab === 'case' && (
      <section className="admin-section">
        <h2 className="admin-section-title">Case study</h2>
        <p className="admin-hint" style={{ margin: '0 0 16px' }}>Everything here is optional; sections only appear on the project page when filled. For lists, put one item per line. Start a line with “Title: …” to give it a bold heading.</p>
        <div className="admin-form-grid">
          <label className="admin-label">
            My role
            <input className="admin-input" value={form.role} onChange={(event) => updateField('role', event.target.value)} placeholder="Lead Gameplay Engineer" />
          </label>
          <label className="admin-label">
            Platforms
            <input className="admin-input" value={form.platforms} onChange={(event) => updateField('platforms', event.target.value)} placeholder="Android, iOS, WebGL" />
          </label>
          <label className="admin-label admin-label-full">
            Contribution summary
            <textarea className="admin-textarea" rows={3} value={form.contribution} onChange={(event) => updateField('contribution', event.target.value)} placeholder="Two or three sentences on what you owned and delivered." />
          </label>
          <label className="admin-label admin-label-full">
            What I built (one per line)
            <textarea className="admin-textarea" rows={5} value={form.contributions} onChange={(event) => updateField('contributions', event.target.value)} placeholder={'Netcode: Built Photon Fusion state sync with lag compensation\nMatchmaking lobby with private room codes'} />
          </label>
          <label className="admin-label">
            Team (one per line)
            <textarea className="admin-textarea" rows={4} value={form.team} onChange={(event) => updateField('team', event.target.value)} placeholder={'3 Developers\n1 UI Artist\n1 Game Designer'} />
          </label>
          <label className="admin-label">
            Recognition / special note
            <textarea className="admin-textarea" rows={4} value={form.recognition} onChange={(event) => updateField('recognition', event.target.value)} placeholder="Awards, launch results, or a certificate this project earned." />
          </label>
          <label className="admin-label admin-label-full">
            Features &amp; highlights (one per line)
            <textarea className="admin-textarea" rows={5} value={form.features} onChange={(event) => updateField('features', event.target.value)} placeholder={'Real-time 6-player online racing\nCloud profiles and leaderboards'} />
          </label>
          <label className="admin-label admin-label-full">
            Technical highlights (one per line, “Title: details”)
            <textarea className="admin-textarea" rows={5} value={form.highlights} onChange={(event) => updateField('highlights', event.target.value)} placeholder={'Procedural generation: Graph-based room stitching with solvability checks'} />
          </label>
          <label className="admin-label admin-label-full">
            Live link (store page, itch.io, or demo)
            <input className="admin-input" type="url" value={form.liveUrl} onChange={(event) => updateField('liveUrl', event.target.value)} placeholder="https://play.google.com/store/apps/details?id=…" pattern="https://.*" />
          </label>
        </div>
      </section>
      )}

      {tab === 'media' && (
      <>
      <section className="admin-section">
        <h2 className="admin-section-title">Cover Image</h2>
        <p style={{ margin: '0 0 12px', opacity: 0.7, fontSize: '13px' }}>Use a 16:9 image, ideally 1920 × 1080 px (JPG or WebP, under ~500 KB). Every card and the project page show it at 16:9, so it is never cropped.</p>
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

      </>
      )}

      <div className={`admin-savebar${dirty ? ' is-dirty' : ''}`} role="region" aria-label="Save project">
        <p role="status" className={error ? 'is-error' : undefined}>
          {error || (uploading ? 'Uploading…' : dirty ? 'You have unsaved changes.' : isEditing ? 'All changes saved.' : 'Fill in the basics to create the project.')}
        </p>
        <div>
          <button type="button" className="admin-button admin-button-small" onClick={() => { if (!dirty || window.confirm('Leave without saving your changes?')) { setLeaving(true); router.push('/admin'); } }}>
            {dirty ? 'Cancel' : 'Back to library'}
          </button>
          <button type="submit" className="admin-button admin-button-primary" disabled={loading || uploading || (isEditing && !dirty)}>
            {loading ? 'Saving…' : isEditing ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </div>
    </form>
  );
}
