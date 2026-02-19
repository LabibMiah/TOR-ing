import styles from "./about.module.css";
import Link from "next/link";
import React from "react";

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>About TOR-ings</h1>
        <p className={styles.subtitle}>Powered by Sheffield Hallam</p>

        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/Login">Login</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <main className={styles.main}>
        {/* MININ IN|TRO FOR |TORS */}
        <section className={styles.section}>
          <h2 className={styles.h2}>
            Technical Operations Resources &amp; Services
          </h2>
          <p className={styles.text}>
            TORS is made up of highly qualified, specialist and experienced
            technical staff. We come from a range of backgrounds including
            industry and research and provide direct student facing support
            across a diverse range of subject areas in teaching, research and
            commercial activities. We manage the university’s specialist spaces
            which include workshops, laboratories, studios, kitchens, sport, and
            health facilities. You can access support from TORS staff using the
            links below.
          </p>
        </section>

        {/* TEH OUR SERVICES SECTIN */}
        <section className={styles.section}>
          <h2 className={styles.h2}>Our services</h2>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>Health and Clinical Simulation</h3>
              <p className={styles.text}>
                The clinical simulation team are based at our Collegiate Crescent
                site mainly in the Robert Winston Building. They support the
                Allied Health professional courses and Nursing and Midwifery. A
                virtual tour of the facilities is available.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>Printmaking Centre</h3>
              <p className={styles.text}>
                Printmaking is based in the Sheffield Institute of Fine Art in
                the Head Post office. The technical team support all modes of
                printmaking and deliver inductions for the facilities.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>Digital Workshops</h3>
              <p className={styles.text}>
                These are in both the Head Post office and Sheaf buildings
                depending on the techniques and facilities that are required.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>Social Science Facilities</h3>
              <p className={styles.text}>
                Support of the technical specialist spaces linked to Social
                Sciences are based within the third floor of Redmires building at
                City Campus. The facilities can be booked using Resource Booker
                and equipment via Connect 2.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>Fashion Workshops</h3>
              <p className={styles.text}>
                The Fashion team support the workshop, design studio and the
                fashion materials store. They provide specialist support on
                several industry standard pieces of equipment.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>Creative Workshops</h3>
              <p className={styles.text}>
                These are based in Sheaf building and the Head Post office and
                include woodworking, metal working (casting and welding),
                ceramics and Jewellery workshops. The team also support the
                construction workshops within Harmer building.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>Creative Media Centre</h3>
              <p className={styles.text}>
                The centre is on level 4 of the Harmer building. Through Connect
                2 Creative Media users can book media equipment for use both on
                and off site. The technical team provide inductions and training
                on setting up and using equipment and software.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>Sport and Exercise Science</h3>
              <p className={styles.text}>
                Located in Collegiate Hall and the AWRC, the sport technical team
                provide support across several laboratories and specialist gym
                facilities which are part of the School of Sport and Physical
                activity.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>
                Service Sector Management – Specialist kitchens and food
                technology facilities
              </h3>
              <p className={styles.text}>
                Located on level 12 of the Owen building and at the Advanced Food
                Innovation Centre (AFIC) located at the Olympic Legacy Park.
                These spaces are made up of several large training kitchens and
                food technology facilities.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>
                Laboratory and Analytical facilities
              </h3>
              <p className={styles.text}>
                The technical team provide specialist support across all our
                teaching and research laboratories. The labs contain an advanced
                portfolio of highly specialised equipment that allows the
                provision of research informed teaching.
              </p>
            </div>

            <div className={styles.serviceCard}>
              <h3 className={styles.h3}>
                Electronics and Engineering facilities
              </h3>
              <p className={styles.text}>
                The technical staff in engineering and in electronics support our
                extensive precision workshops and electronics laboratories in
                Sheaf building and Cantor building. The facilities are used by
                engineering, computing and physics students.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>© 2026 My Website</footer>
    </div>
  );
}
