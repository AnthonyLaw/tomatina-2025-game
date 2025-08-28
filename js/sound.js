// Small helper to play overlapping sounds reliably
export function initSound(audioEl) {
    audioEl.volume = 0.9;
    function play() {
        try {
            const s = audioEl.cloneNode(true);      // overlapping hits
            s.volume = audioEl.volume;
            // Important for Safari autoplay policies: only plays after first user gesture
            s.play().catch(() => { });
        } catch (_) { }
    }
    return { play };
}
