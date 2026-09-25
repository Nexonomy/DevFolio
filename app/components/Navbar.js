export default function Navbar({ profile }) {
  return <header className="navbar"><a className="skip-link" href="#main">Skip to content</a><a href="#hero" className="navbar-logo">{profile.name}</a><nav aria-label="Main navigation"><a href="#hero">Intro</a><a href="#work">Work</a><a href="#experience">Experience</a><a href="#contact">Contact</a></nav></header>;
}
