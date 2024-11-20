import { exec } from "child_process";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const repoPaths = JSON.parse(fs.readFileSync("./repos.json", "utf-8"));
const logFilePath = process.env.LOG_FILE_PATH || "./info.log";
const emailRecipient = process.env.EMAIL_RECIPIENT;

fs.writeFileSync(logFilePath, "Git Automation Log\n\n", "utf-8");

function executeCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
            } else {
                resolve(stdout.trim() || stderr.trim());
            }
        });
    });
}

function logMessage(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
    console.log(message);
}

async function checkForChanges(repo) {
    try {
        logMessage(`[${repo.name}] Comprobando cambios no stageados...`);
        const statusOutput = await executeCommand("git status --porcelain", repo.path);
        const hasUnstagedChanges = statusOutput.length > 0;

        logMessage(`[${repo.name}] Comprobando commits no pusheados...`);
        const branchName = await executeCommand("git rev-parse --abbrev-ref HEAD", repo.path);
        const logOutput = await executeCommand(`git log origin/${branchName}..${branchName} --oneline`, repo.path);
        const hasUnpushedCommits = logOutput.length > 0;

        return { hasUnstagedChanges, hasUnpushedCommits };
    } catch (error) {
        logMessage(`[${repo.name}] Error: ${error.message}`);
        throw error;
    }
}

async function runGitAutomation(repo) {
    try {
        const { hasUnstagedChanges, hasUnpushedCommits } = await checkForChanges(repo);

        if (!hasUnstagedChanges && !hasUnpushedCommits) {
            logMessage(`[${repo.name}] No hay cambios para stagear, commitear o pushear.`);
            return;
        }

        if (hasUnstagedChanges) {
            logMessage(`[${repo.name}] Ejecutando git add .`);
            await executeCommand("git add .", repo.path);

            logMessage(`[${repo.name}] Ejecutando git commit -m "WIP"`);
            await executeCommand('git commit -m "WIP"', repo.path);
        }

        if (hasUnpushedCommits || hasUnstagedChanges) {
            logMessage(`[${repo.name}] Ejecutando git push`);
            await executeCommand("git push", repo.path);
        }

        logMessage(`[${repo.name}] ¡Los comandos de Git se ejecutaron con éxito!`);
    } catch (error) {
        logMessage(`[${repo.name}] Error: ${error.message}`);
    }
}

async function sendEmailWithLog() {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Git Automation" <${process.env.EMAIL_USER}>`,
            to: emailRecipient,
            subject: "Git Automation Status Log",
            text: "Adjunto el resumen de los estados del script de automatización de Git.",
            attachments: [
                {
                    filename: "automation.log",
                    path: logFilePath
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        logMessage("Correo enviado con éxito.");
    } catch (error) {
        logMessage(`Error enviando el correo: ${error.message}`);
    }
}

async function runAutomationForAllRepos() {
    for (const repo of repoPaths) {
        logMessage(`\n*** Procesando repositorio: ${repo.name} ***`);
        await runGitAutomation(repo);
    }

    await sendEmailWithLog();
}

runAutomationForAllRepos();