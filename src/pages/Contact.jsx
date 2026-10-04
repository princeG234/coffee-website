import { useState } from "react";
import { LocationIcon, PhoneIcon, EmailIcon, ClockIcon, MapIcon, CheckIcon, WarningIcon } from "../components/Icons";
import SectionHeader from "../components/SectionHeader";
import { CAFE_INFO } from "../data/cafeInfo";

const infoCards = [
  { icon: LocationIcon, title: "Visit Us", lines: ["123 Coffee Street", "Brewville, BV 10001"] },
  { icon: PhoneIcon, title: "Call Us", lines: ["(555) 123-4567"] },
  { icon: EmailIcon, title: "Email Us", lines: ["hello@brewbliss.com"] },
  { icon: ClockIcon, title: "Working Hours", lines: CAFE_INFO.hours },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFeedback("");
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields before sending your message.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to send your message.");
      }
      setSubmitted(true);
      setFeedback(result.message || "Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-page section-padding bg-light">
      <div className="container">
        <SectionHeader
          subtitle="Get in Touch"
          title="We'd Love to Hear From You"
          desc="Have a question, feedback, or just want to say hello? Drop us a message!"
        />

        <div className="contact-wrapper">
          <div className="contact-form-container">
            {submitted && (
              <div className="contact-success">
                <CheckIcon size={20} /> {feedback}
              </div>
            )}
            {error && (
              <div className="contact-error">
                <WarningIcon size={20} /> {error}
              </div>
            )}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-btn">
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <div className="contact-info">
            {infoCards.map(({ icon: Icon, title, lines }) => (
              <div key={title} className="info-card">
                <div className="info-icon">
                  <Icon size={32} />
                </div>
                <h4>{title}</h4>
                {lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="contact-map">
          <div className="map-placeholder">
            <MapIcon size={48} />
            <p>Find us on Google Maps</p>
            <small>123 Coffee Street, Brewville</small>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
