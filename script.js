const openGithubProject = () => {
    window.open("https://github.com/lawskqy/interactive-recipe");
};

const openGithub = () => {
    window.open("https://github.com/lawskqy");
};

const openEmail = () => {
    window.open("mailto:anastasiiaradchenko2003@gmail.com");
};

const openLinkedin = () => {
    window.open("https://www.linkedin.com/");
};

// On small screens, give the page room while reading and reveal navigation on the way back up.
const navigation = document.querySelector(".navigation");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const hasFocusedControl = navigation?.contains(document.activeElement);

    if (currentScrollY <= 12 || !scrollingDown || hasFocusedControl) {
        navigation?.classList.remove("nav-hidden");
    } else if (currentScrollY > 80) {
        navigation?.classList.add("nav-hidden");
    }
    lastScrollY = currentScrollY;
}, { passive: true });

navigation?.addEventListener("focusin", () => navigation.classList.remove("nav-hidden"));
