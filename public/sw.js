self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/android-chrome-192x192.png',
            badge: '/android-chrome-192x192.png',
            vibrate: [200, 100, 200],
            tag: 'vibe-' + Date.now(), // Unique tag to prevent throttling/grouping issues
            renotify: true,
            title: data.title, // Add title here for completeness
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.url || '/'
            }
        };

        event.waitUntil(
            Promise.all([
                self.registration.showNotification(data.title, options),
                // Try to set app badge if supported
                (async () => {
                    if ('setAppBadge' in navigator) {
                        // Since we don't track total count in SW yet, we can't increment accurately without backend support.
                        // But we can set a flag or try to read from storage if we had it.
                        // For now, let's just set it to 1 to indicate "something new" if it was 0, 
                        // or ideally we'd want to increment. 
                        // Without persistent state, we might just set it to 1.
                        // However, the user wants a count. 
                        // Let's assume for now we just show a badge.
                        try {
                            await navigator.setAppBadge(1);
                        } catch (e) {
                            console.error("Failed to set app badge", e);
                        }
                    }
                })()
            ])
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // 1. Try to find an existing window to focus
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // 2. If no window found, open a new one
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
