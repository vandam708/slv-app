(function () {
    function safeParseNotes(raw) {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    }

    function unlockNotes(encryptedNotes, pass, crypto) {
        if (!pass) return { ok: false, reason: 'EMPTY_PASSWORD', notes: [] };

        if (!encryptedNotes) {
            return { ok: true, reason: 'NEW_VAULT', notes: [] };
        }

        try {
            const bytes = crypto.AES.decrypt(encryptedNotes, pass);
            const decryptedData = bytes.toString(crypto.enc.Utf8);
            if (!decryptedData) {
                return { ok: false, reason: 'WRONG_PASSWORD', notes: [] };
            }
            return { ok: true, reason: 'UNLOCKED', notes: safeParseNotes(decryptedData) };
        } catch (_) {
            return { ok: false, reason: 'DECRYPT_ERROR', notes: [] };
        }
    }

    function encryptNotes(notes, pass, crypto) {
        if (!pass) return null;
        try {
            return crypto.AES.encrypt(JSON.stringify(notes || []), pass).toString();
        } catch (_) {
            return null;
        }
    }

    window.SLVSecretEngine = {
        unlockNotes,
        encryptNotes
    };
})();