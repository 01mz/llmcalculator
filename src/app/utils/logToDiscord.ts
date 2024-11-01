const channelId = process.env.DISCORD_CHANNEL_ID;
const botToken = process.env.DISCORD_BOT_TOKEN;

export function logToDiscord(req: Request, message: string, file?: File) {
    const { searchParams } = new URL(req.url);
    const detectedIp = searchParams.get('ip') ?? '?';

    const formData = new FormData();
    if (file) {
        formData.append("file", file, file.name);
    }
    formData.append("content", `${detectedIp}: ${message}`);

    fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
            "Authorization": `Bot ${botToken}`,
        },
        body: formData,
    }).then(res => {
        if (res.ok) {
            console.log("Logged to discord!");
        } else {
            res.json().then(err => {
                console.error("Failed to log to discord:", err);
            });
        }
    }).catch((err) => {
        console.error("Failed to log to Discord:", err);
    });


};
