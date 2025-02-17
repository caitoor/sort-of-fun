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

<style>
    nav {
        background-color: #1e1e1e;
        padding: 15px;
        border-bottom: 2px solid #292929;
    }

    ul {
        display: flex;
        justify-content: center;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        margin: 0 20px;
    }

    a {
        text-decoration: none;
        color: var(--primary-color);
        font-weight: 600;
        font-size: 1.1rem;
        padding: 8px 12px;
        border-radius: 5px;
        transition: background 0.3s;
    }

    a:hover {
        background-color: #292929;
    }

    .active a {
        background-color: var(--primary-color);
        color: #121212;
    }
</style>
