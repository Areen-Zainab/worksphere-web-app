# WorkSphere: Task Management & Team Collaboration Tool

## Introduction
WorkSphere is a modern task management and team collaboration tool designed to streamline workflows, enhance productivity, and improve communication within teams. Inspired by tools like GitHub Issues, Trello, and ClickUp, WorkSphere balances simplicity, flexibility, and powerful features to cater to various team structures and work styles.

## Project Vision
WorkSphere aims to provide a centralized workspace for teams to organize tasks, track progress, and collaborate efficiently. It supports various project management methodologies, including Agile, Scrum, and Kanban, reducing inefficiencies and communication gaps.

## End-Users & Stakeholders
- **Project Managers** – Assign tasks, track progress, and oversee project milestones.
- **Team Members** – Manage workloads, collaborate, and update task statuses.
- **Freelancers & Remote Workers** – Organize tasks, set deadlines, and integrate with clients.
- **Business Owners & Executives** – Gain insights into project progress through analytics.

## Features
- **Task Management** – Create, assign, prioritize, and track tasks.
- **Kanban Boards** – Visualize tasks in columns (To-Do, In Progress, Done).
- **Activity Logs** – Track changes and updates made to tasks.
- **File Attachments & Document Sharing** – Upload and share relevant files.
- **Comments & Mentions** – Discuss tasks and tag specific users.
- **Deadlines & Reminders** – Set due dates, reminders, and alerts for overdue tasks.
- **Notifications & Alerts** – Keep team members updated on task changes.
- **User Roles & Permissions** – Define access levels (Admin, Member, Viewer).
- **Reporting & Analytics** – Visualize project status and team performance.

## Benefits
- Enhanced task organization and visibility.
- Reduced miscommunication and improved collaboration.
- Increased efficiency in tracking progress.
- Data-driven insights for better decision-making.

### Technologies Used
- **Backend:** Java, Spring Boot
- **Frontend:** REACT, HTML, CSS, JavaScript
- **Database:** MySQL
- **Version Control:** Git, GitHub
- **Build Tools:** Maven
- **Development Environment:** Visual Studio Code, IntelliJ IDEA
- **Security:** Spring Security, JWT Authentication

---

# How to Run WorkSphere

## 1. Clone the Repository

To download the project, use the following command:
```sh
 git clone https://github.com/hafsa-imtiaz/worksphere.git
 cd worksphere
```

## 2. Required Software and Setup
Before running WorkSphere, ensure you have the following installed:

- **Java Development Kit (JDK) 17+** ([Download JDK](https://www.oracle.com/java/technologies/javase-downloads.html))
- **Spring Boot** (Managed via `pom.xml`)
- **MySQL Server** (To store project and task data)
- **VS Code Extensions** (Optional, but recommended)
  - Live Server (for frontend development)
  - Spring Boot Extension Pack (for backend development)
  - Java Extension Pack (for Java support)
  - Lombok Annotations Support for VS Code

---

## 3. Database Setup (MySQL)
1. Start **MySQL Server**.
2. Open **MySQL Workbench** or a terminal.
3. Create the database:
   ```sql
   CREATE DATABASE worksphere_db;
   ```
4. Import the provided SQL file to set up tables.

---

## 4. Configure Backend (Spring Boot)
The backend is located in `com.example.worksphere` and consists of:
- `config` – Security and database settings.
- `dto` – Data transfer objects.
- `entity` – Database models.
- `repository` – Database interaction.
- `service` – Business logic.

### Update `application.properties` for MySQL:
```properties
spring.application.name=worksphere_db
spring.datasource.url=jdbc:mysql://localhost:3306/worksphere_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```
Replace `your_password` with your MySQL password.

### Run the Backend:
```sh
mvn spring-boot:run
```
If Maven is not installed, use:
Navigate to the `frontend` folder.
```sh
./mvnw spring-boot:run
```
The backend should now be running on `http://localhost:8080`.


### Run the Frontend:
```sh
cd frontend
```
Now run this command:
```sh
npm start
```
The frontenfd should now be running on `http://localhost:3000`.

---

## 6. Common Issues and Fixes

### **Backend Not Starting**
- Ensure MySQL is running.
- Verify `application.properties` contains the correct database credentials.

### **Login Not Working**
- Check the browser console (`F12 > Console`).
- Ensure the backend is running.

### **Signup Not Storing Data**
- Verify the MySQL database contains the necessary tables.

---

## 7. PPT slides
https://www.canva.com/design/DAGmRuAM47I/Jsl7piBqG6nuL_rc3uEKtA/view?utm_content=DAGmRuAM47I&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h9ca240c4c4

---

## 7. Contributors
- Hafsa Imtiaz
- Areen Zainab
- Mahum Hamid

---

## 8. License
This project is licensed under the [MIT License](LICENSE).

