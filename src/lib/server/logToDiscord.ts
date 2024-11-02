const channelId = process.env.DISCORD_CHANNEL_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

export async function logToDiscord(req: Request, message: string, file?: File) {
    const detectedIp = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(/, /)[0] ?? '?';

    const formData = new FormData();
    if (file) {
        formData.append("file", file, file.name);
    }
    formData.append("content", `${detectedIp}: ${message}`);

    try {
        const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bot ${botToken}`,
            },
            body: formData,
        });
        if (res.ok) {
            console.log("Logged to discord!");
        } else {
            res.json().then(err => {
                console.error("Failed to log to discord:", err);
            });
        }
    } catch (err) {
        console.error("Failed to log to Discord:", err);
    }
};
