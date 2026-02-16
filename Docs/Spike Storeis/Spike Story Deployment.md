# Spike Story Template

A spike is a **time-boxed research task** used to reduce uncertainty or risk.
It focuses on learning, not delivering production features.

---

## Spike Title

Spike – Deployment

---

## Background / Context

Briefly describe:
- Why this spike is needed
- What uncertainty or risk it addresses
<br>
This spike is needed to understand how the web application will be deployed using Visual Studio as the primary development and deployment management tool. Since the project is a web application with a database, the team needs to research how deployment can be handled from Visual Studio and what additional services or configurations are required to make the system accessible for a university submission.
There is uncertainty around how deployment is managed through Visual Studio, how the application will be hosted, and how the database (Supabase/Firebase) will connect securely in a deployed environment. A lack of understanding could lead todeployment failures, configuration issues, or delays close to the submission deadline.



---

## Question to Answer

What specific question should this spike answer?

How can the web application be deployed using Visual Studio, and what steps, tools, and configurations are required to successfully deploy a Next.js application with a database for a university project?

---

## Time-Box

- **Maximum time allowed:** ___3___ hours

(The spike must stop when this time expires.)

---

## Tasks / Investigation

What will you do during the spike?
-The team will:
Investigate how Visual Studio supports deployment workflows for web applications.
Research how Next.js applications can be deployed using Visual Studio tools.
Explore common deployment errors when deploying from Visual Studio.
Identify risks related to database security and configuration.


## Expected Outcome

At the end of the spike, we expect:
- [ ] A clear understanding of the deployment process using Visual Studio.
- [ ] A clear deployment approach suitable for university submission.
- [ ] Identification of deployment risks and limitations.
- [ ] Increased team confidence in performing deployment

---

## Findings / Notes

Summarise what you learned:
- 
- The investigation showed that Visual Studio can be used to help deploy web applications by working with external hosting services. The application needs to be configured correctly, especially environment variables and database connections. Some extra setup may be required depending on the hosting service used, and mistakes in configuration could cause the application not to run properly or fail to connect to the database.
- 

---

## Recommendation / Next Steps

Based on this spike, we recommend:
- 
-Using Visual Studio to manage the deployment process.
Choosing a hosting service that works well with Next.js.
Testing the deployment early to avoid problems later .

---

## Owner 
Kaif

- **Responsible team member:**

---

> A spike is successful if it reduces uncertainty — not if it produces perfect code.
