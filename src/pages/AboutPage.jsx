function AboutPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h2>About this app</h2>
      <p>
        This todo app helps you organize tasks, avoid forgetting work, and keep the
        workflow focused and simple.
      </p>

      <section>
        <h3>Features</h3>
        <ul>
          <li>Authentication and protected routes</li>
          <li>Todo creation, updates, and completion tracking</li>
          <li>URL-based status filtering</li>
          <li>User profile summary and stats</li>
        </ul>
      </section>

      <section>
        <h3>Technologies used</h3>
        <ul>
          <li>React</li>
          <li>React Router</li>
          <li>Vite</li>
        </ul>
      </section>
    </main>
  );
}

export default AboutPage;
