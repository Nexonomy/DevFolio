/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';

const blankExperience = () => ({ period: '', role: '', organization: '', type: 'Company', icon: '✦', description: '', current: false });
const blankTool = () => ({ name: '', icon: '◇' });

export default function ProfileForm({ initialProfile }) {
  const [form, setForm] = useState(initialProfile);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
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
      <div><p className="admin-kicker">Personal data</p><h1 className="admin-title">Your story,<br />in one place.</h1><p className="admin-subtitle">Edit the identity, bio, timeline, toolkit and contact details shown across the portfolio.</p></div>
      <button className="admin-button admin-button-primary admin-profile-save" type="submit" disabled={saving}>{saving ? <><span className="admin-login-loader"><i /><i /><i /></span> Saving…</> : 'Save profile ↗'}</button>
    </header>

    {status && <p className={status.startsWith('Saved') ? 'admin-save-status is-success' : 'admin-error'} role="status">{status}</p>}

    <section className="admin-profile-panel">
      <div className="admin-profile-panel-title"><span>01</span><div><h2>Identity & opening</h2><p>The first words visitors see.</p></div></div>
      <div className="admin-form-grid">
        <label className="admin-label">Your name<input className="admin-input" value={form.name} onChange={(e) => setField('name', e.target.value)} required /></label>
        <label className="admin-label">Small introduction<input className="admin-input" value={form.heroEyebrow} onChange={(e) => setField('heroEyebrow', e.target.value)} required /></label>
        <label className="admin-label">Hero headline<input className="admin-input" value={form.heroLead} onChange={(e) => setField('heroLead', e.target.value)} required /></label>
        <label className="admin-label">Hero accent line<input className="admin-input" value={form.heroAccent} onChange={(e) => setField('heroAccent', e.target.value)} required /></label>
        <label className="admin-label admin-label-full">Hero introduction<textarea className="admin-textarea" rows="3" value={form.heroSubtitle} onChange={(e) => setField('heroSubtitle', e.target.value)} required /></label>
      </div>
      <div className="admin-portrait-editor">
        <div className="admin-portrait-preview">
          {form.profileImageUrl ? <img src={form.profileImageUrl} alt="Current profile portrait" /> : <span aria-hidden="true">{form.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</span>}
        </div>
        <div><strong>Profile portrait</strong><p>Use a clear square or vertical image. It will appear in the Human Bit section.</p><div className="admin-portrait-actions"><label className="admin-button admin-button-small">{uploadingPortrait ? 'Uploading…' : form.profileImageUrl ? 'Replace image' : 'Upload image'}<input type="file" accept="image/*" onChange={uploadPortrait} disabled={uploadingPortrait} /></label>{form.profileImageUrl && <button type="button" className="admin-button admin-button-small admin-button-danger" onClick={() => setField('profileImageUrl', null)}>Remove</button>}</div></div>
      </div>
    </section>

    <section className="admin-profile-panel">
      <div className="admin-profile-panel-title"><span>02</span><div><h2>Bio & values</h2><p>The human part behind your work.</p></div></div>
      <label className="admin-label">About headline<input className="admin-input" value={form.bioTitle} onChange={(e) => setField('bioTitle', e.target.value)} required /></label>
      <label className="admin-label">Bio paragraphs<textarea className="admin-textarea" rows="7" value={form.bioParagraphs.join('\n\n')} onChange={(e) => setField('bioParagraphs', e.target.value.split(/\n\s*\n/))} /><small className="admin-field-help">Separate paragraphs with a blank line.</small></label>
      <label className="admin-label">Creative values<input className="admin-input" value={form.values.join(', ')} onChange={(e) => setField('values', e.target.value.split(',').map((value) => value.trim()))} /><small className="admin-field-help">Separate values with commas.</small></label>
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
            <label className="admin-label">Icon<input className="admin-input" value={item.icon} onChange={(e) => updateItem('experiences', index, { icon: e.target.value })} /></label>
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