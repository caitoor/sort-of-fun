<script>
    import { page } from "$app/stores";

    let currentRoute = "";

    // Subscribe to the current route
    $: {
        page.subscribe((value) => {
            currentRoute = value.url.pathname;
        });
    }
</script>

<header>
    <h1>sort-of-fun</h1>
    <nav>
        <ul>
            <li class={currentRoute === "/" ? "active" : ""}>
                <a href="/">Overview</a>
            </li>
            <li class={currentRoute === "/game-selection" ? "active" : ""}>
                <a href="/game-selection">Game Selection</a>
            </li>
            <li class={currentRoute === "/settings" ? "active" : ""}>
                <a href="/settings">Settings</a>
            </li>
        </ul>
    </nav>
</header>

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-content: center;
        padding: 1em 0;
    }

    header h1 {
        font-size: 1.5rem;
        margin: 0;
    }

    nav {
        display: flex;
        align-items: center;
    }

    ul {
        display: flex;
        list-style: none;
        align-items: center;
        padding: 0;
        margin: 0;
        gap: 2em;
    }

    a {
        text-decoration: none;
        color: var(--primary-color);
    }

    .active a {
        font-weight: bold;
        color: var(--primary-color);
    }

    .active a:hover {
        text-decoration: none;
    }
</style>
