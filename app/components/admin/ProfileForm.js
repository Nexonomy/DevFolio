/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';

const TRACKS = [
  { value: 'PROFESSIONAL', label: 'Professional', type: 'Full-time' },
  { value: 'ACADEMIC', label: 'Leadership & community', type: 'Volunteer' },
  { value: 'ACHIEVEMENT', label: 'Achievements', type: 'Award' },
];
const TYPE_SUGGESTIONS = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Volunteer', 'Leadership', 'Mentoring', 'Tutoring', 'Award', 'Competition', 'National', 'Regional', 'Industry', 'Academic'];
const TABS = [
  { id: 'intro', label: 'Intro' },
  { id: 'experience', label: 'Experience' },
  { id: 'toolkit', label: 'Toolkit' },
  { id: 'copy', label: 'Section text' },
  { id: 'contact', label: 'Contact & files' },
];

const blankExperience = (track = 'PROFESSIONAL') => ({ period: '', role: '', organization: '', type: TRACKS.find((item) => item.value === track)?.type || 'Full-time', track, icon: '✦', logoImageUrl: null, certificateImages: [], description: '', current: false });
const blankTool = () => ({ name: '', icon: '◇' });
const LINK_PRESETS = [
  { label: 'Instagram', url: 'https://instagram.com/' },
  { label: 'Discord', url: 'https://discord.com/users/' },
  { label: 'X', url: 'https://x.com/' },
  { label: 'YouTube', url: 'https://youtube.com/@' },
  { label: 'itch.io', url: 'https://.itch.io' },
  { label: 'ArtStation', url: 'https://artstation.com/' },
  { label: 'Behance', url: 'https://behance.net/' },
  { label: 'Steam', url: 'https://store.steampowered.com/' },
  { label: 'Website', url: 'https://' },
];
const trackOf = (item) => item.track || 'ACADEMIC';
const trackLabel = (value) => TRACKS.find((item) => item.value === value)?.label || 'Leadership & community';

export default function ProfileForm({ initialProfile }) {
  const [form, setForm] = useState(initialProfile);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialProfile));
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [uploadingExperienceLogo, setUploadingExperienceLogo] = useState(null);
  const [activeTab, setActiveTab] = useState('intro');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [openExperience, setOpenExperience] = useState(null);
  const [draggedTool, setDraggedTool] = useState(null);
  const dirty = JSON.stringify(form) !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const setCopy = (key, value) => setForm((current) => ({ ...current, sectionCopy: { ...current.sectionCopy, [key]: value } }));
  const updateItem = (field, index, patch) => setForm((current) => ({ ...current, [field]: current[field].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const removeItem = (field, index) => setForm((current) => ({ ...current, [field]: current[field].filter((_, itemIndex) => itemIndex !== index) }));
  const reorderItem = (field, from, to) => setForm((current) => {
    if (from === to || from == null || to == null) return current;
    const next = [...current[field]];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return { ...current, [field]: next };
  });
  const moveItem = (field, index, direction) => setForm((current) => {
    const next = [...current[field]];
    const destination = index + direction;
    if (destination < 0 || destination >= next.length) return current;
    [next[index], next[destination]] = [next[destination], next[index]];
    return { ...current, [field]: next };
  });
  // Moves an experience past the nearest entry in the same group, so ordering inside a group never jumps across groups.
  const neighbourInTrack = (index, direction) => {
    const track = trackOf(form.experiences[index]);
    for (let cursor = index + direction; cursor >= 0 && cursor < form.experiences.length; cursor += direction) {
      if (trackOf(form.experiences[cursor]) === track) return cursor;
    }
    return null;
  };
  const moveExperience = (index, direction) => {
    const target = neighbourInTrack(index, direction);
    if (target == null) return;
    setForm((current) => {
      const next = [...current.experiences];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, experiences: next };
    });
    if (openExperience === index) setOpenExperience(target);
  };
  const addExperience = () => {
    const track = trackFilter === 'ALL' ? 'PROFESSIONAL' : trackFilter;
    setForm((current) => ({ ...current, experiences: [...current.experiences, blankExperience(track)] }));
    setOpenExperience(form.experiences.length);
  };
  const removeExperience = (index) => {
    const item = form.experiences[index];
    if (!window.confirm(`Remove “${item.role || 'this entry'}”? You can still cancel by not saving.`)) return;
    removeItem('experiences', index);
    setOpenExperience(null);
  };

  const uploadPortrait = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingPortrait(true); setStatus('');
    try {
      const body = new FormData(); body.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Portrait upload failed');
      setField('profileImageUrl', data.url);
      setStatus('Portrait uploaded. Save the profile to publish it.');
    } catch (error) { setStatus(error.message); }
    finally { setUploadingPortrait(false); event.target.value = ''; }
  };
  const uploadExperienceImage = async (event, index, field = 'logoImageUrl') => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploadingExperienceLogo(`${index}-${field}`); setStatus('');
    try {
      const body = new FormData(); body.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Image upload failed');
      updateItem('experiences', index, { [field]: data.url });
      setStatus('Organization logo uploaded. Save the profile to publish it.');
    } catch (error) { setStatus(error.message); }
    finally { setUploadingExperienceLogo(null); input.value = ''; }
  };
  const certificatesOf = (item) => [...new Set([...(item.certificateImages || []), item.certificateImageUrl].filter(Boolean))];
  const setCertificates = (index, update) => setForm((current) => ({
    ...current,
    experiences: current.experiences.map((item, itemIndex) => itemIndex === index
      ? { ...item, certificateImageUrl: null, certificateImages: update(certificatesOf(item)) }
      : item),
  }));
  const uploadCertificates = async (event, index) => {
    const input = event.currentTarget;
    const files = [...(input.files || [])];
    if (!files.length) return;
    setUploadingExperienceLogo(`${index}-certificates`); setStatus('');
    const uploaded = [];
    try {
      for (const file of files) {
        const body = new FormData(); body.append('file', file);
        const response = await fetch('/api/upload', { method: 'POST', body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Upload failed for ${file.name}`);
        uploaded.push(data.url);
      }
      setStatus(`${uploaded.length} image${uploaded.length === 1 ? '' : 's'} uploaded. Save the profile to publish.`);
    } catch (error) {
      setStatus(uploaded.length ? `${uploaded.length} uploaded, then: ${error.message}` : error.message);
    } finally {
      if (uploaded.length) setCertificates(index, (images) => [...images, ...uploaded].slice(0, 12));
      setUploadingExperienceLogo(null); input.value = '';
    }
  };
  const save = async (event) => {
    event?.preventDefault(); setSaving(true); setStatus('');
    try {
      const response = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save profile');
      setForm(data); setSavedSnapshot(JSON.stringify(data));
      setStatus('Saved. Your public portfolio now uses this content.');
    } catch (error) { setStatus(error.message); }
    finally { setSaving(false); }
  };

  const experienceRows = form.experiences
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => trackFilter === 'ALL' || trackOf(item) === trackFilter);
  const countFor = (value) => form.experiences.filter((item) => trackOf(item) === value).length;

  return <form className="admin-form admin-profile-form" onSubmit={save} noValidate>
    <header className="admin-form-header admin-profile-heading">
      <div><p className="admin-kicker">Profile and content</p><h1 className="admin-title">Portfolio content,<br />in one place.</h1><p className="admin-subtitle">Pick a tab, edit, then save. Changes appear on the live site immediately after saving.</p></div>
    </header>

    <nav className="admin-profile-tabs" role="tablist" aria-label="Profile sections">
      {TABS.map((tab) => (
        <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'is-active' : undefined} onClick={() => setActiveTab(tab.id)}>
          {tab.label}{tab.id === 'experience' && <span>{form.experiences.length}</span>}{tab.id === 'toolkit' && <span>{form.tools.length}</span>}
        </button>
      ))}
    </nav>

    {activeTab === 'intro' && (
      <section className="admin-profile-panel">
        <div className="admin-profile-panel-title"><div><h2>Identity &amp; opening</h2><p>The first words and picture visitors see.</p></div></div>
        <div className="admin-form-grid">
          <label className="admin-label">Your name<input className="admin-input" value={form.name} onChange={(e) => setField('name', e.target.value)} /></label>
          <label className="admin-label">Label above your name<input className="admin-input" value={form.sectionCopy.introKicker} onChange={(e) => setCopy('introKicker', e.target.value)} /></label>
          <label className="admin-label admin-label-full">Introduction<textarea className="admin-textarea" rows="3" value={form.heroSubtitle} onChange={(e) => setField('heroSubtitle', e.target.value)} /></label>
        </div>
        <div className="admin-portrait-editor">
          <div className="admin-portrait-preview">
            {form.profileImageUrl ? <img src={form.profileImageUrl} alt="Current profile portrait" /> : <span aria-hidden="true">{form.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</span>}
          </div>
          <div><strong>Profile portrait</strong><p>Use a clear square or vertical image. It appears beside the introduction.</p><div className="admin-portrait-actions"><label className="admin-button admin-button-small">{uploadingPortrait ? 'Uploading…' : form.profileImageUrl ? 'Replace image' : 'Upload image'}<input type="file" accept="image/*" onChange={uploadPortrait} disabled={uploadingPortrait} /></label>{form.profileImageUrl && <button type="button" className="admin-button admin-button-small admin-button-danger" onClick={() => setField('profileImageUrl', null)}>Remove</button>}</div></div>
        </div>
      </section>
    )}

    {activeTab === 'experience' && (
      <section className="admin-profile-panel">
        <div className="admin-profile-panel-title">
          <div><h2>Experience</h2><p>Click an entry to edit it. Entries in the same group keep the order you set here; roles at the same organization are grouped on the site automatically.</p></div>
          <button type="button" className="admin-button admin-button-small" onClick={addExperience}>+ Add {trackFilter === 'ALL' ? 'entry' : trackLabel(trackFilter).toLowerCase()}</button>
        </div>
        <div className="admin-exp-filter" role="group" aria-label="Show group">
          <button type="button" aria-pressed={trackFilter === 'ALL'} onClick={() => setTrackFilter('ALL')}>All <span>{form.experiences.length}</span></button>
          {TRACKS.map((track) => <button key={track.value} type="button" aria-pressed={trackFilter === track.value} onClick={() => setTrackFilter(track.value)}>{track.label} <span>{countFor(track.value)}</span></button>)}
        </div>
        <div className="admin-repeater-list">
          {experienceRows.length === 0 && <p className="admin-hint">Nothing in this group yet. Use “+ Add” above.</p>}
          {experienceRows.map(({ item, index }) => {
            const isOpen = openExperience === index;
            const incomplete = !item.role?.trim() || !item.period?.trim();
            const images = certificatesOf(item);
            return (
              <article className={`admin-repeater-card admin-exp-card${isOpen ? ' is-open' : ''}`} key={index}>
                <div className="admin-exp-summary">
                  <button type="button" className="admin-exp-toggle" aria-expanded={isOpen} onClick={() => setOpenExperience(isOpen ? null : index)}>
                    <span className="admin-exp-badge">{item.logoImageUrl ? <img src={item.logoImageUrl} alt="" /> : (item.icon || '✦')}</span>
                    <span className="admin-exp-text">
                      <strong>{item.role || 'Untitled entry'}</strong>
                      <small>{[item.organization, item.period].filter(Boolean).join(' · ') || 'Add an organization and period'}</small>
                    </span>
                    <span className="admin-exp-tags">
                      {trackFilter === 'ALL' && <em>{trackLabel(trackOf(item))}</em>}
                      {item.current && <em className="is-current">Current</em>}
                      {images.length > 0 && <em>{images.length} image{images.length === 1 ? '' : 's'}</em>}
                      {incomplete && <em className="is-warning">Needs a role and period, or it’s dropped on save</em>}
                    </span>
                    <b aria-hidden="true">{isOpen ? '−' : '+'}</b>
                  </button>
                  <div className="admin-exp-order">
                    <button type="button" aria-label="Move up" onClick={() => moveExperience(index, -1)} disabled={neighbourInTrack(index, -1) == null}>↑</button>
                    <button type="button" aria-label="Move down" onClick={() => moveExperience(index, 1)} disabled={neighbourInTrack(index, 1) == null}>↓</button>
                  </div>
                </div>

                {isOpen && (
                  <div className="admin-exp-body">
                    <div className="admin-form-grid">
                      <label className="admin-label">Role / title<input className="admin-input" value={item.role} onChange={(e) => updateItem('experiences', index, { role: e.target.value })} placeholder="Associate Software Engineer" /></label>
                      <label className="admin-label">Organization<input className="admin-input" value={item.organization} onChange={(e) => updateItem('experiences', index, { organization: e.target.value })} placeholder="MangoMango Games" /></label>
                      <label className="admin-label">Period<input className="admin-input" value={item.period} onChange={(e) => updateItem('experiences', index, { period: e.target.value })} placeholder="Aug 2025 — Present" /></label>
                      <label className="admin-label">Type<input className="admin-input" list="admin-experience-types" value={item.type} onChange={(e) => updateItem('experiences', index, { type: e.target.value })} placeholder="Full-time" /></label>
                      <label className="admin-label">Group<select className="admin-input" value={trackOf(item)} onChange={(e) => updateItem('experiences', index, { track: e.target.value })}>{TRACKS.map((track) => <option key={track.value} value={track.value}>{track.label}</option>)}</select></label>
                      <label className="admin-label admin-checkbox-label"><input type="checkbox" checked={Boolean(item.current)} onChange={(e) => updateItem('experiences', index, { current: e.target.checked })} /> I’m currently doing this</label>
                      <label className="admin-label admin-label-full">Description<textarea className="admin-textarea" rows="3" value={item.description} onChange={(e) => updateItem('experiences', index, { description: e.target.value })} placeholder="One or two sentences on what you did and the result." /></label>
                    </div>

                    <div className="admin-experience-logo-editor admin-label-full">
                      <div className="admin-experience-logo-preview">
                        {item.logoImageUrl ? <img src={item.logoImageUrl} alt={`${item.organization || item.role} logo preview`} /> : <span>{item.icon || '✦'}</span>}
                      </div>
                      <div>
                        <strong>Logo or badge</strong>
                        <p>Upload a square logo, or type up to 4 characters to show instead.</p>
                        <div className="admin-portrait-actions">
                          <input className="admin-input admin-badge-input" aria-label="Badge text" value={item.icon} maxLength={4} onChange={(e) => updateItem('experiences', index, { icon: e.target.value })} />
                          <label className="admin-button admin-button-small">
                            {uploadingExperienceLogo === `${index}-logoImageUrl` ? 'Uploading…' : item.logoImageUrl ? 'Replace logo' : 'Upload logo'}
                            <input type="file" accept="image/*" onChange={(event) => uploadExperienceImage(event, index, 'logoImageUrl')} disabled={uploadingExperienceLogo !== null} />
                          </label>
                          {item.logoImageUrl && <button type="button" className="admin-button admin-button-small admin-button-danger" onClick={() => updateItem('experiences', index, { logoImageUrl: null })}>Remove logo</button>}
                        </div>
                      </div>
                    </div>

                    <div className="admin-label-full admin-exp-certificates">
                      <strong>Certificates and photos</strong>
                      <p>Optional, up to 12. The first image is the card thumbnail; visitors can browse all of them.</p>
                      {images.length > 0 && (
                        <ul className="admin-certificate-grid">
                          {images.map((url, imageIndex) => (
                            <li key={url}>
                              <img src={url} alt={`Certificate ${imageIndex + 1} preview`} />
                              {imageIndex === 0 && <span>Cover</span>}
                              <div>
                                <span>
                                  <button type="button" className="admin-button admin-button-small" disabled={imageIndex === 0} aria-label="Move image earlier" onClick={() => setCertificates(index, (list) => { const next = [...list]; [next[imageIndex - 1], next[imageIndex]] = [next[imageIndex], next[imageIndex - 1]]; return next; })}>←</button>
                                  <button type="button" className="admin-button admin-button-small" disabled={imageIndex === images.length - 1} aria-label="Move image later" onClick={() => setCertificates(index, (list) => { const next = [...list]; [next[imageIndex + 1], next[imageIndex]] = [next[imageIndex], next[imageIndex + 1]]; return next; })}>→</button>
                                </span>
                                <button type="button" className="admin-button admin-button-small admin-button-danger" aria-label={`Remove image ${imageIndex + 1}`} onClick={() => setCertificates(index, (list) => list.filter((entry) => entry !== url))}>✕</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <label className="admin-button admin-button-small">
                        {uploadingExperienceLogo === `${index}-certificates` ? 'Uploading…' : images.length ? 'Add more images' : 'Upload images'}
                        <input type="file" accept="image/*" multiple onChange={(event) => uploadCertificates(event, index)} disabled={uploadingExperienceLogo !== null || images.length >= 12} />
                      </label>
                    </div>

                    <div className="admin-exp-footer">
                      <button type="button" className="admin-button admin-button-small" onClick={() => setOpenExperience(null)}>Done</button>
                      <button type="button" className="admin-button admin-button-small admin-button-danger" onClick={() => removeExperience(index)}>Remove entry</button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <datalist id="admin-experience-types">{TYPE_SUGGESTIONS.map((type) => <option key={type} value={type} />)}</datalist>
      </section>
    )}

    {activeTab === 'toolkit' && (
      <section className="admin-profile-panel">
        <div className="admin-profile-panel-title"><div><h2>Toolkit</h2><p>Drag tools, or use ← →, to set the order shown on the site. The icon can be a symbol or up to 4 letters.</p></div><button type="button" className="admin-button admin-button-small" onClick={() => setField('tools', [...form.tools, blankTool()])}>+ Add tool</button></div>
        <div className="admin-tool-editor-grid">{form.tools.map((tool, index) => (
          <div
            className={`admin-tool-editor is-sortable${draggedTool === index ? ' is-dragging' : ''}`}
            key={index}
            draggable
            onDragStart={(event) => { setDraggedTool(index); event.dataTransfer.effectAllowed = 'move'; }}
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
            onDrop={(event) => { event.preventDefault(); reorderItem('tools', draggedTool, index); setDraggedTool(null); }}
            onDragEnd={() => setDraggedTool(null)}
          >
            <span className="admin-tool-handle" title="Drag to reorder" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <input aria-label="Tool icon" value={tool.icon} onChange={(e) => updateItem('tools', index, { icon: e.target.value })} />
            <input aria-label="Tool name" value={tool.name} onChange={(e) => updateItem('tools', index, { name: e.target.value })} placeholder="Tool name" />
            <button type="button" aria-label={`Move ${tool.name || 'tool'} earlier`} disabled={index === 0} onClick={() => moveItem('tools', index, -1)}>←</button>
            <button type="button" aria-label={`Move ${tool.name || 'tool'} later`} disabled={index === form.tools.length - 1} onClick={() => moveItem('tools', index, 1)}>→</button>
            <button type="button" aria-label={'Remove ' + tool.name} onClick={() => removeItem('tools', index)}>×</button>
          </div>
        ))}</div>
      </section>
    )}

    {activeTab === 'copy' && (
      <section className="admin-profile-panel">
        <div className="admin-profile-panel-title"><div><h2>Section text</h2><p>Headings and short descriptions for each part of the home page, in page order.</p></div></div>
        <div className="admin-copy-group">
          <h3>Projects</h3>
          <div className="admin-form-grid">
            <label className="admin-label">Heading<input className="admin-input" value={form.sectionCopy.workTitle} onChange={(e) => setCopy('workTitle', e.target.value)} /></label>
            <label className="admin-label admin-label-full">Description<textarea className="admin-textarea" rows="2" value={form.sectionCopy.workDescription} onChange={(e) => setCopy('workDescription', e.target.value)} /></label>
          </div>
        </div>
        <div className="admin-copy-group">
          <h3>Additional projects</h3>
          <div className="admin-form-grid">
            <label className="admin-label">Heading<input className="admin-input" value={form.sectionCopy.otherTitle} onChange={(e) => setCopy('otherTitle', e.target.value)} /></label>
            <label className="admin-label admin-label-full">Description<textarea className="admin-textarea" rows="2" value={form.sectionCopy.otherDescription} onChange={(e) => setCopy('otherDescription', e.target.value)} /></label>
          </div>
        </div>
        <div className="admin-copy-group">
          <h3>Experience</h3>
          <div className="admin-form-grid">
            <label className="admin-label">Heading<input className="admin-input" value={form.sectionCopy.experienceTitle} onChange={(e) => setCopy('experienceTitle', e.target.value)} /></label>
            <label className="admin-label admin-label-full">Description<textarea className="admin-textarea" rows="2" value={form.sectionCopy.experienceDescription} onChange={(e) => setCopy('experienceDescription', e.target.value)} /></label>
          </div>
        </div>
        <div className="admin-copy-group">
          <h3>Contact</h3>
          <div className="admin-form-grid">
            <label className="admin-label">Small line above heading<input className="admin-input" value={form.sectionCopy.contactPrompt} onChange={(e) => setCopy('contactPrompt', e.target.value)} /></label>
            <label className="admin-label">Heading<input className="admin-input" value={form.sectionCopy.contactTitle} onChange={(e) => setCopy('contactTitle', e.target.value)} /></label>
          </div>
        </div>
      </section>
    )}

    {activeTab === 'contact' && (
      <section className="admin-profile-panel">
        <div className="admin-profile-panel-title"><div><h2>Contact &amp; files</h2><p>Where people can reach you and download your résumé. The contact form delivers to this email.</p></div></div>
        <div className="admin-form-grid">
          <label className="admin-label">Email<input className="admin-input" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} /></label>
          <label className="admin-label">Résumé path or URL<input className="admin-input" value={form.resumeUrl || ''} onChange={(e) => setField('resumeUrl', e.target.value)} /></label>
          <label className="admin-label">GitHub URL<input className="admin-input" type="url" value={form.githubUrl || ''} onChange={(e) => setField('githubUrl', e.target.value)} /></label>
          <label className="admin-label">LinkedIn URL<input className="admin-input" type="url" value={form.linkedinUrl || ''} onChange={(e) => setField('linkedinUrl', e.target.value)} /></label>
        </div>

        <div className="admin-copy-group">
          <h3>Other links</h3>
          <p className="admin-hint" style={{ margin: '0 0 12px' }}>Shown after LinkedIn, GitHub, and Résumé in the intro and contact sections, in this order. Links must start with https:// (or mailto: for email).</p>
          <div className="admin-link-presets">
            {LINK_PRESETS.map((preset) => (
              <button key={preset.label} type="button" onClick={() => setField('links', [...(form.links || []), { label: preset.label, url: preset.url }])}>+ {preset.label}</button>
            ))}
          </div>
          {(form.links || []).length === 0 && <p className="admin-hint">No extra links yet. Pick one above or add a custom link.</p>}
          <div className="admin-link-list">
            {(form.links || []).map((link, index) => {
              const valid = /^(https:\/\/|mailto:)/i.test(link.url || '') && link.label?.trim();
              return (
                <div className="admin-link-row" key={index}>
                  <input className="admin-input" aria-label="Link label" value={link.label} onChange={(e) => updateItem('links', index, { label: e.target.value })} placeholder="Label" />
                  <input className="admin-input" aria-label="Link URL" value={link.url} onChange={(e) => updateItem('links', index, { url: e.target.value })} placeholder="https://…" />
                  <button type="button" aria-label="Move link earlier" disabled={index === 0} onClick={() => moveItem('links', index, -1)}>↑</button>
                  <button type="button" aria-label="Move link later" disabled={index === form.links.length - 1} onClick={() => moveItem('links', index, 1)}>↓</button>
                  <button type="button" aria-label={`Remove ${link.label || 'link'}`} onClick={() => removeItem('links', index)}>×</button>
                  {!valid && <small>Needs a label and a URL starting with https:// or mailto:, or it won’t be saved.</small>}
                </div>
              );
            })}
          </div>
          <button type="button" className="admin-button admin-button-small" onClick={() => setField('links', [...(form.links || []), { label: '', url: 'https://' }])}>+ Custom link</button>
        </div>
      </section>
    )}

    <div className={`admin-savebar${dirty ? ' is-dirty' : ''}`} role="region" aria-label="Save changes">
      <p role="status" className={status && !status.startsWith('Saved') && !status.includes('uploaded') ? 'is-error' : undefined}>
        {status || (dirty ? 'You have unsaved changes.' : 'All changes saved.')}
      </p>
      <div>
        {dirty && <button type="button" className="admin-button admin-button-small" onClick={() => { if (window.confirm('Discard all unsaved changes?')) { setForm(JSON.parse(savedSnapshot)); setStatus(''); } }}>Discard</button>}
        <a className="admin-button admin-button-small" href="/" target="_blank" rel="noreferrer">Preview ↗</a>
        <button className="admin-button admin-button-primary" type="submit" disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </div>
  </form>;
}
