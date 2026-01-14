# 🚀 Deployment Guide: ClinicFlow on Hostinger (Node.js)

Since your plan includes **"5 Node.js web apps"**, you can deploy ClinicFlow directly without a VPS!

## 1. Prepare the Code (Local Machine)

We need to build the project locally because Hostinger's build servers are often weak.

1.  **Open Terminal** in your project folder.
2.  **Run Build:**
    ```powershell
    npm run build
    ```
3.  **Find the `.next` folder:**
    Inside `.next`, you will see a folder called `standalone`. This is what we upload.

4.  **Prepare Files to Upload:**
    Create a new folder named `deploy` on your Desktop and copy these files into it:
    - `.next/standalone/*` (Copy everything inside standalone, including `node_modules` and `server.js`)
    - `.next/static` folder -> Copy this to `deploy/.next/static`
    - `public` folder -> Copy this to `deploy/public`
    
    *Structure should look like:*
    ```text
    deploy/
    ├── .next/
    │   ├── static/
    ├── public/
    ├── node_modules/
    ├── server.js
    ```

5.  **Zip the `deploy` folder.** (Name it `clinicflow-deploy.zip`).

## 2. Setup Hostinger

1.  Log in to Hostinger hPanel.
2.  Go to **Websites > Manage**.
3.  Find **Node.js** in the sidebar (Advanced section).
4.  **Create Application:**
    - **Node.js Version:** Choose **v18** or **v20** (Recommended).
    - **Application Mode:** `Production`.
    - **Application Root:** `public_html/app` (or just `app`).
    - **Application URL:** leave default.
    - **Startup File:** `server.js`.
    - Click **Create**.

## 3. Upload Files

1.  Go to **File Manager**.
2.  Navigate to the folder you created (e.g., `public_html/app`).
3.  **Upload** your `clinicflow-deploy.zip`.
4.  **Extract** it there.
5.  Ensure `server.js` is legally in the root of your App folder.

## 4. Database Setup

1.  Go to **Databases > Management**.
2.  Create a new MySQL Database.
    - Note down: `DB Name`, `Username`, `Password`.
3.  **Env Variables:**
    - Go back to **Node.js** settings.
    - Add Environment Variables:
      - `DATABASE_URL`: `mysql://USER:PASSWORD@localhost:3306/DB_NAME`
      - `NEXTAUTH_SECRET`: Generate a random string (e.g. `openssl rand -base64 32`).
      - `NEXTAUTH_URL`: `https://your-domain.com`

## 5. Start App

1.  In **Node.js** settings, click **Install NPM Packages** (Using the button, just to be safe, though standalone has modules).
    *Actually, standalone usually has them. If button fails, ignore it.*
2.  Click **Restart**.
3.  Visit your website!

## Troubleshooting

- **Error 500?** Check "cat stderr.log" in File Manager to see errors.
- **Static files missing (404 for CSS)?**
  - Next.js standalone sometimes needs `public` and `.next/static` manually placed correctly.
  - Make sure `.next/static` exists in the host folder.
