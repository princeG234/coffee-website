const SectionHeader = ({ subtitle, title, desc }) => (
  <div className="section-header">
    {subtitle && <span className="section-subtitle">{subtitle}</span>}
    <h2 className="section-title">{title}</h2>
    {desc && <p className="section-desc">{desc}</p>}
  </div>
);

export default SectionHeader;

