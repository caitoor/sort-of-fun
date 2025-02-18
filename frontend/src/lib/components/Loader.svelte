<script>
    // src/lib/components/Loader.svelte
    // loading animations

    export let size = "1em";
</script>

<div class="spinner" style="width: {size}; height: {size};"></div>

<style>
    .spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
