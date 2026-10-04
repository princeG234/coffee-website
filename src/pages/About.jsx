import { CoffeeIcon, ChefIcon } from "../components/Icons";
import SectionHeader from "../components/SectionHeader";

const team = [
  { id: 1, name: "Marco Rossi", role: "Master Roaster", bio: "15 years of roasting expertise from Italy" },
  { id: 2, name: "Elena Chen", role: "Head Barista", bio: "Award-winning latte artist & coffee connoisseur" },
  { id: 3, name: "David Park", role: "Brew Master", bio: "Specializes in cold brew & pour-over techniques" },
];

const timeline = [
  { year: "2015", event: "Brew Bliss founded in a small garage" },
  { year: "2017", event: "Opened first flagship cafe downtown" },
  { year: "2019", event: "Launched our signature cold brew line" },
  { year: "2021", event: "Expanded to 5 locations nationwide" },
  { year: "2023", event: "Awarded Best Coffee Shop in the city" },
];

const stats = [
  { number: "50K+", label: "Happy Customers" },
  { number: "15+", label: "Coffee Origins" },
  { number: "10", label: "Years of Excellence" },
];

const About = () => {
  return (
    <section className="about-page section-padding bg-light">
      <div className="container">
        <SectionHeader
          subtitle="Our Story"
          title={<>Passion Brewed<span className="hero-highlight"> Since 2015</span></>}
          desc="What started as a dream between two friends has grown into a community of coffee lovers."
        />

        {/* Story */}
        <div className="about-story">
          <div className="about-story-content">
            <p>
              Brew Bliss was born from a simple belief: that everyone deserves a perfect cup of coffee. We source our beans directly from sustainable farms in Ethiopia, Colombia, and Brazil, ensuring ethical practices and exceptional quality.
            </p>
            <p>
              Our master roasters carefully craft each batch to bring out the unique flavor profiles of every origin. From the first crack to the final pour, we are dedicated to the art of coffee.
            </p>
            <div className="about-stats">
              {stats.map((s) => (
                <div key={s.label} className="stat">
                  <span className="stat-number">{s.number}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="about-story-image">
            <div className="about-image-placeholder">
              <div className="about-image-rotate"></div>
              <div className="about-image-icon">
                <CoffeeIcon size={80} />
              </div>
              <p className="about-image-caption">Crafted with Love</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="about-timeline">
          <h3 className="timeline-title">Our Journey</h3>
          <div className="timeline">
            <div className="timeline-line"></div>
            {timeline.map((item) => (
              <div key={item.year} className="timeline-item">
                <span className="timeline-dot"></span>
                <div className="timeline-content">
                  <span className="timeline-year">{item.year}</span>
                  <p>{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="about-team">
          <h3 className="timeline-title">Meet Our Team</h3>
          <div className="team-grid">
            {team.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-avatar">
                  <ChefIcon size={64} />
                </div>
                <h4 className="team-name">{member.name}</h4>
                <span className="team-role">{member.role}</span>
                <p className="team-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
