/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';

const blankExperience = () => ({ period: '', role: '', organization: '', type: 'Company', track: 'PROFESSIONAL', icon: '✦', logoImageUrl: null, certificateImages: [], description: '', current: false });
const blankTool = () => ({ name: '', icon: '◇' });

export default function ProfileForm({ initialProfile }) {
  const [form, setForm] = useState(initialProfile);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [uploadingExperienceLogo, setUploadingExperienceLogo] = useState(null);
  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const updateItem = (field, index, patch) => setForm((current) => ({ ...current, [field]: current[field].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  const removeItem = (field, index) => setForm((current) => ({ ...current, [field]: current[field].filter((_, itemIndex) => itemIndex !== index) }));
  const moveItem = (field, index, direction) => setForm((current) => {
    const next = [...current[field]];
    const destination = index + direction;
    if (destination < 0 || destination >= next.length) return current;
    [next[index], next[destination]] = [next[destination], next[index]];
    return { ...current, [field]: next };
  });


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
    event.preventDefault(); setSaving(true); setStatus('');
    try {
      const response = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save profile');
      setForm(data); setStatus('Saved. Your public portfolio now uses this content.');
    } catch (error) { setStatus(error.message); }
    finally { setSaving(false); }
  };

  return <form className="admin-form admin-profile-form" onSubmit={save}>
    <header className="admin-form-header admin-profile-heading">
      <div><p className="admin-kicker">Profile and content</p><h1 className="admin-title">Portfolio content,<br />in one place.</h1><p className="admin-subtitle">Manage the introduction, section headings, experience, toolkit, and contact details shown on the portfolio.</p></div>
      <button className="admin-button admin-button-primary admin-profile-save" type="submit" disabled={saving}>{saving ? <><span className="admin-login-loader"><i /><i /><i /></span> Saving…</> : 'Save profile ↗'}</button>
    </header>

    {status && <p className={status.startsWith('Saved') || status.includes('uploaded') ? 'admin-save-status is-success' : 'admin-error'} role="status">{status}</p>}

    <section className="admin-profile-panel">
      <div className="admin-profile-panel-title"><span>01</span><div><h2>Identity & opening</h2><p>The first words visitors see.</p></div></div>
      <div className="admin-form-grid">
        <label className="admin-label">Your name<input className="admin-input" value={form.name} onChange={(e) => setField('name', e.target.value)} required /></label>
        <label className="admin-label admin-label-full">Introduction<textarea className="admin-textarea" rows="3" value={form.heroSubtitle} onChange={(e) => setField('heroSubtitle', e.target.value)} required /></label>
      </div>
      <div className="admin-portrait-editor">
        <div className="admin-portrait-preview">
          {form.profileImageUrl ? <img src={form.profileImageUrl} alt="Current profile portrait" /> : <span aria-hidden="true">{form.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</span>}
        </div>
        <div><strong>Profile portrait</strong><p>Use a clear square or vertical image. It appears beside the introduction.</p><div className="admin-portrait-actions"><label className="admin-button admin-button-small">{uploadingPortrait ? 'Uploading…' : form.profileImageUrl ? 'Replace image' : 'Upload image'}<input type="file" accept="image/*" onChange={uploadPortrait} disabled={uploadingPortrait} /></label>{form.profileImageUrl && <button type="button" className="admin-button admin-button-small admin-button-danger" onClick={() => setField('profileImageUrl', null)}>Remove</button>}</div></div>
      </div>
    </section>

    <section className="admin-profile-panel">
      <div className="admin-profile-panel-title"><span>02</span><div><h2>Section copy</h2><p>Edit the headings and descriptions used on the public portfolio.</p></div></div>
      <div className="admin-form-grid">
        <label className="admin-label admin-label-full">Introduction label<input className="admin-input" value={form.sectionCopy.introKicker} onChange={(e) => setField('sectionCopy', { ...form.sectionCopy, introKicker: e.target.value })} required /></label>
        <label className="admin-label">Portfolio heading<input className="admin-input" value={form.sectionCopy.workTitle} onChange={(e) => setField('sectionCopy', { ...form.sectionCopy, workTitle: e.target.value })} required /></label>
        <label className="admin-label">Additional projects heading<input className="admin-input" value={form.sectionCopy.otherTitle} onChange={(e) => setField('sectionCopy', { ...form.sectionCopy, otherTitle: e.target.value })} required /></label>
        <label className="admin-label admin-label-full">Portfolio description<textarea className="admin-textarea" rows="3" value={form.sectionCopy.workDescription} onChange={(e) => setField('sectionCopy', { ...form.sectionCopy, workDescription: e.target.value })} required /></label>
        <label className="admin-label admin-label-full">Additional projects description<textarea className="admin-textarea" rows="3" value={form.sectionCopy.otherDescription} onChange={(e) => setField('sectionCopy', { ...form.sectionCopy, otherDescription: e.target.value })} required /></label>
        <label className="admin-label">Experience heading<input className="admin-input" value={form.sectionCopy.experienceTitle} onChange={(e) => setField('sectionCopy', { ...form.sectionCopy, experienceTitle: e.target.value })} required /></label>
        <label className="admin-label">Contact heading<input className="admin-input" value={form.sectionCopy.contactTitle} onChange={(e) => setField('sectionCopy', { ...form.sectionCopy, contactTitle: e.target.value })} required /></label>
        <label className="admin-label admin-label-full">Experience description<textarea className="admin-textarea" rows="3" value={form.sectionCopy.experienceDescription} onChange={(e) => setField('sectionCopy', { ...form.sectionCopy, experienceDescription: e.target.value })} required /></label>
        <label className="admin-label admin-label-full">Contact prompt<input className="admin-input" value={form.sectionCopy.contactPrompt} onChange={(e) => setField('sectionCopy', { ...form.sectionCopy, contactPrompt: e.target.value })} required /></label>
      </div>
    </section>

    <section className="admin-profile-panel">
      <div className="admin-profile-panel-title"><span>03</span><div><h2>Experience timeline</h2><p>Keep the newest or current role at the top.</p></div><button type="button" className="admin-button admin-button-small" onClick={() => setField('experiences', [...form.experiences, blankExperience()])}>+ Add experience</button></div>
      <div className="admin-repeater-list">
        {form.experiences.map((item, index) => <article className="admin-repeater-card" key={index}>
          <div className="admin-repeater-index"><strong>{String(index + 1).padStart(2, '0')}</strong><span>{item.current ? 'Current' : 'Timeline'}</span></div>
          <div className="admin-form-grid">
            <label className="admin-label">Period<input className="admin-input" value={item.period} onChange={(e) => updateItem('experiences', index, { period: e.target.value })} required /></label>
            <label className="admin-label">Role<input className="admin-input" value={item.role} onChange={(e) => updateItem('experiences', index, { role: e.target.value })} required /></label>
            <label className="admin-label">Organization<input className="admin-input" value={item.organization} onChange={(e) => updateItem('experiences', index, { organization: e.target.value })} /></label>
            <label className="admin-label">Type<input className="admin-input" value={item.type} onChange={(e) => updateItem('experiences', index, { type: e.target.value })} /></label>
            <label className="admin-label">Experience section<select className="admin-input" value={item.track || 'ACADEMIC'} onChange={(e) => updateItem('experiences', index, { track: e.target.value })}><option value="PROFESSIONAL">Professional experience</option><option value="ACADEMIC">Leadership &amp; community</option><option value="ACHIEVEMENT">Achievement</option></select></label>
            <label className="admin-label">Icon<input className="admin-input" value={item.icon} onChange={(e) => updateItem('experiences', index, { icon: e.target.value })} /></label>
            <div className="admin-experience-logo-editor admin-label-full">
              <div className="admin-experience-logo-preview">
                {item.logoImageUrl ? <img src={item.logoImageUrl} alt={`${item.organization || item.role} logo preview`} /> : <span>{String(index + 1).padStart(2, '0')}</span>}
              </div>
              <div>
                <strong>Organization logo</strong>
                <p>Optional. A square PNG, JPG, WebP, or SVG works best. Without one, the numbered badge stays visible.</p>
                <div className="admin-portrait-actions">
                  <label className="admin-button admin-button-small">
                    {uploadingExperienceLogo === `${index}-logoImageUrl` ? 'Uploading…' : item.logoImageUrl ? 'Replace logo' : 'Upload logo'}
                    <input type="file" accept="image/*" onChange={(event) => uploadExperienceImage(event, index, 'logoImageUrl')} disabled={uploadingExperienceLogo !== null} />
                  </label>
                  {item.logoImageUrl && <button type="button" className="admin-button admin-button-small admin-button-danger" onClick={() => updateItem('experiences', index, { logoImageUrl: null })}>Remove logo</button>}
                </div>
              </div>
            </div>
            <div className="admin-label-full">
              <strong>Certificates and photos</strong>
              <p style={{ margin: '4px 0 12px', opacity: 0.7, fontSize: '13px' }}>Optional, up to 12. The first image is the card thumbnail; visitors can browse all of them full size. Use the arrows to reorder.</p>
              {certificatesOf(item).length > 0 && (
                <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', margin: '0 0 12px', padding: 0, listStyle: 'none' }}>
                  {certificatesOf(item).map((url, imageIndex, images) => (
                    <li key={url} style={{ position: 'relative', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={url} alt={`Certificate ${imageIndex + 1} preview`} style={{ display: 'block', width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }} />
                      {imageIndex === 0 && <span style={{ position: 'absolute', top: '6px', left: '6px', padding: '2px 6px', borderRadius: '4px', background: '#000c', fontSize: '10px' }}>Cover</span>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', padding: '6px' }}>
                        <span style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" className="admin-button admin-button-small" disabled={imageIndex === 0} aria-label="Move image earlier" onClick={() => setCertificates(index, (list) => { const next = [...list]; [next[imageIndex - 1], next[imageIndex]] = [next[imageIndex], next[imageIndex - 1]]; return next; })}>←</button>
                          <button type="button" className="admin-button admin-button-small" disabled={imageIndex === images.length - 1} aria-label="Move image later" onClick={() => setCertificates(index, (list) => { const next = [...list]; [next[imageIndex + 1], next[imageIndex]] = [next[imageIndex], next[imageIndex + 1]]; return next; })}>→</button>
                        </span>
                        <button type="button" className="admin-button admin-button-small admin-button-danger" aria-label={`Remove image ${imageIndex + 1}`} onClick={() => setCertificates(index, (list) => list.filter((entry) => entry !== url))}>✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="admin-portrait-actions">
                <label className="admin-button admin-button-small">
                  {uploadingExperienceLogo === `${index}-certificates` ? 'Uploading…' : certificatesOf(item).length ? 'Add more images' : 'Upload images'}
                  <input type="file" accept="image/*" multiple onChange={(event) => uploadCertificates(event, index)} disabled={uploadingExperienceLogo !== null || certificatesOf(item).length >= 12} />
                </label>
              </div>
            </div>
            <label className="admin-label admin-checkbox-label"><input type="checkbox" checked={item.current} onChange={(e) => updateItem('experiences', index, { current: e.target.checked })} /> Current role</label>
            <label className="admin-label admin-label-full">Description<textarea className="admin-textarea" rows="3" value={item.description} onChange={(e) => updateItem('experiences', index, { description: e.target.value })} /></label>
          </div>
          <div className="admin-repeater-actions"><button type="button" onClick={() => moveItem('experiences', index, -1)} disabled={index === 0}>↑</button><button type="button" onClick={() => moveItem('experiences', index, 1)} disabled={index === form.experiences.length - 1}>↓</button><button type="button" className="is-danger" onClick={() => removeItem('experiences', index)}>Remove</button></div>
        </article>)}
      </div>
    </section>

    <section className="admin-profile-panel">
      <div className="admin-profile-panel-title"><span>04</span><div><h2>Creative toolkit</h2><p>Add each tool separately with a short icon or monogram.</p></div><button type="button" className="admin-button admin-button-small" onClick={() => setField('tools', [...form.tools, blankTool()])}>+ Add tool</button></div>
      <div className="admin-tool-editor-grid">{form.tools.map((tool, index) => <div className="admin-tool-editor" key={index}><input aria-label="Tool icon" value={tool.icon} onChange={(e) => updateItem('tools', index, { icon: e.target.value })} /><input aria-label="Tool name" value={tool.name} onChange={(e) => updateItem('tools', index, { name: e.target.value })} /><button type="button" aria-label={'Remove ' + tool.name} onClick={() => removeItem('tools', index)}>×</button></div>)}</div>
    </section>

    <section className="admin-profile-panel">
      <div className="admin-profile-panel-title"><span>05</span><div><h2>Contact & files</h2><p>Where people can reach you and download your résumé.</p></div></div>
      <div className="admin-form-grid">
        <label className="admin-label">Email<input className="admin-input" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required /></label>
        <label className="admin-label">GitHub URL<input className="admin-input" type="url" value={form.githubUrl || ''} onChange={(e) => setField('githubUrl', e.target.value)} /></label>
        <label className="admin-label">LinkedIn URL<input className="admin-input" type="url" value={form.linkedinUrl || ''} onChange={(e) => setField('linkedinUrl', e.target.value)} /></label>
        <label className="admin-label">Résumé path or URL<input className="admin-input" value={form.resumeUrl || ''} onChange={(e) => setField('resumeUrl', e.target.value)} /></label>
      </div>
    </section>

    <div className="admin-form-actions admin-profile-footer"><button className="admin-button admin-button-primary" type="submit" disabled={saving}>{saving ? 'Saving profile…' : 'Save all changes'}</button><a className="admin-button" href="/" target="_blank">Preview portfolio ↗</a></div>
  </form>;
}
