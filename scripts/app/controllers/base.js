export default class BaseController {
    download(url, prefix) {
        const filename = `${prefix}-${Date.now()}`;
        const a = document.createElement("a");

        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    createRenderingProgressNotification(progress) {
        const notificationId = "render";

        if (progress === 100) {
            chrome.notifications.clear(notificationId);

            return;
        }

        if (progress === 0) {
            chrome.notifications.create(
                notificationId,
                {
                    type: "progress",
                    iconUrl: "icon128.png",
                    title: "Rendering... ",
                    message: "Gifster creates your gif :)",
                    progress: 0
                }
            )
        }
        else {
            chrome.notifications.update(
                notificationId,
                {progress}
            );
        }
    }
}