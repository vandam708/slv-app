(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyAhkOgEtlG1Q2byn2PKB6iCySPqM5XocMY",
        authDomain: "slv-project-a51ff.firebaseapp.com",
        projectId: "slv-project-a51ff",
        storageBucket: "slv-project-a51ff.firebasestorage.app",
        messagingSenderId: "561475846978",
        appId: "1:561475846978:web:91f259136416b621d43edb",
        measurementId: "G-L8C9XEZLH4"
    };

    const CLOUD_SCHEMA_VERSION = 2;

    function create(callbacks = {}) {
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        db.enablePersistence().catch((err) => {
            if (err.code === 'failed-precondition') console.log('Tabs open');
            else if (err.code === 'unimplemented') console.log('Browser not supported');
        });

        let currentUser = null;
        let cloudUnsubscribe = null;
        const originalSetItem = localStorage.setItem;
        const originalRemoveItem = localStorage.removeItem;
        const cloudWriteBuffer = {};
        const cloudDeleteBuffer = new Set();
        let cloudSyncTimer = null;

        function isSyncKey(key) {
            return !!key && (key.startsWith('slv_') || key === 'bogdan_config_tasks');
        }

        function buildCloudPayloadFromLocal(isBootstrap = false) {
            const payload = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!isSyncKey(key)) continue;
                const value = localStorage.getItem(key);
                if (value !== null) payload[key] = value;
            }

            payload.__meta = {
                schemaVersion: CLOUD_SCHEMA_VERSION,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (isBootstrap) {
                payload.__meta.bootstrapFromLocalAt = firebase.firestore.FieldValue.serverTimestamp();
            }

            return payload;
        }

        function applyCloudData(data) {
            for (const [key, value] of Object.entries(data || {})) {
                if (!isSyncKey(key)) continue;
                if (typeof value !== 'string') continue;
                originalSetItem.apply(localStorage, [key, value]);
            }
        }

        function scheduleCloudSync() {
            if (!currentUser) return;
            if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
            cloudSyncTimer = setTimeout(flushCloudSync, 700);
        }

        function flushCloudSync() {
            if (!currentUser) return;

            const payload = { ...cloudWriteBuffer };
            cloudDeleteBuffer.forEach((key) => {
                payload[key] = firebase.firestore.FieldValue.delete();
            });

            Object.keys(cloudWriteBuffer).forEach((key) => delete cloudWriteBuffer[key]);
            cloudDeleteBuffer.clear();

            if (Object.keys(payload).length === 0) return;

            payload.__meta = {
                schemaVersion: CLOUD_SCHEMA_VERSION,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            db.collection('users')
                .doc(currentUser.uid)
                .set(payload, { merge: true })
                .catch((error) => console.error('Cloud sync error:', error));
        }

        function patchLocalStorage() {
            if (window.__slvCloudStoragePatched) return;

            localStorage.setItem = function (key, value) {
                originalSetItem.apply(this, [key, value]);
                if (!isSyncKey(key)) return;
                cloudWriteBuffer[key] = value;
                cloudDeleteBuffer.delete(key);
                scheduleCloudSync();
            };

            localStorage.removeItem = function (key) {
                originalRemoveItem.apply(this, [key]);
                if (!isSyncKey(key)) return;
                delete cloudWriteBuffer[key];
                cloudDeleteBuffer.add(key);
                scheduleCloudSync();
            };

            window.__slvCloudStoragePatched = true;
        }

        function loadDataFromCloud() {
            if (!currentUser) return;

            if (cloudUnsubscribe) {
                cloudUnsubscribe();
                cloudUnsubscribe = null;
            }

            cloudUnsubscribe = db.collection('users').doc(currentUser.uid).onSnapshot(async (doc) => {
                if (doc.exists) {
                    applyCloudData(doc.data() || {});
                    callbacks.onCloudData?.();
                    console.log('Cloud sync: data updated');
                    return;
                }

                console.log('First login: bootstrapping local data to cloud');
                try {
                    await db.collection('users').doc(currentUser.uid).set(buildCloudPayloadFromLocal(true), { merge: true });
                } catch (error) {
                    console.error('Cloud bootstrap error:', error);
                }
                callbacks.onCloudBootstrap?.();
            }, (error) => {
                console.error('Cloud listener error:', error);
                callbacks.onCloudError?.(error);
            });

            callbacks.onCloudReady?.();
        }

        function showLocalModeOption() {
            const isFileProtocol = location.protocol === 'file:';
            const isForcedLocal = new URLSearchParams(location.search).has('local');
            if (!isFileProtocol && !isForcedLocal) return;

            const btn = document.getElementById('localModeBtn');
            const hint = document.getElementById('localModeHint');
            if (btn) btn.style.display = 'flex';
            if (hint) hint.style.display = 'block';
        }

        function loginWithGoogle() {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).catch((error) => {
                alert("Ошибка входа: " + error.message);
            });
        }

        function enterLocalMode() {
            currentUser = null;
            if (cloudUnsubscribe) {
                cloudUnsubscribe();
                cloudUnsubscribe = null;
            }
            callbacks.onLocalMode?.();
        }

        patchLocalStorage();
        showLocalModeOption();

        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                callbacks.onSignedIn?.(user);
                loadDataFromCloud();
                return;
            }

            currentUser = null;
            if (cloudUnsubscribe) {
                cloudUnsubscribe();
                cloudUnsubscribe = null;
            }
            callbacks.onSignedOut?.();
        });

        return {
            loginWithGoogle,
            enterLocalMode,
            getCurrentUser: () => currentUser,
            flushCloudSync
        };
    }

    window.SLVFirebaseClient = {
        create
    };
})();
