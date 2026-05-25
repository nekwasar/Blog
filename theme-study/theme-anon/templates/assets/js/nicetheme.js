/*
            /$$
    /$$    /$$$$
   | $$   |_  $$    /$$$$$$$
 /$$$$$$$$  | $$   /$$_____/
|__  $$__/  | $$  |  $$$$$$
   | $$     | $$   \____  $$
   |__/    /$$$$$$ /$$$$$$$/
          |______/|_______/
================================
        Keep calm and get rich.
                    Is the best.
*/
function cookieExists(id) {
    return document.cookie.split(";").some((item) => item.includes(`${id}=`));
}

document.addEventListener("alpine:init", () => {
    Alpine.data("postMetaData", () => ({
        loading: false,
        liked: false,
        like(_, type = "post") {
            if (this.loading || this.liked) return;
            this.loading = true;
            $.ajax({
                url: "/apis/api.halo.run/v1alpha1/trackers/upvote",
                type: "post",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(
                    type === "post"
                        ? {
                            group: "content.halo.run",
                            plural: "posts",
                            name: this.postId,
                        }
                        : {
                            group: "moment.halo.run",
                            plural: "moments",
                            name: this.postId,
                        }
                ),
            })
            .done(() => {
                this.liked = true;

                // set cookie
                const d = new Date();
                d.setTime(d.getTime() + 999 * 24 * 60 * 60 * 1000);
                let expires = "expires=" + d.toUTCString();
                document.cookie =
                    "suxing_ding_" + this.postId + "=1" + ";" + expires + ";path=/";

                this.likesCount += 1;
            })
            .always(() => {
                this.loading = false;
            });
        },
        init() {
            this.liked = cookieExists("suxing_ding_" + this.postId);
        },
    }));
});

/*
    popup
    ----------------------------------------------------
*/
function ncPopupTips(type, msg) {
    var c = type ? "success" : "error";
    var html =
            '<div class="nice-popup nice-popup-sm nice-popup-error ' +
            c +
            '">' +
            '<div class="nice-popup-body">' +
            '<div class="nice-popup-content">' +
            msg +
            "</div>" +
            "</div>" +
            "</div>";
    var tips = $(html);
    $("body").append(tips);

    setTimeout(function () {
        tips.addClass("nice-popup-open");
    }, 300);

    if (typeof lazyLoadInstance !== "undefined") {
        lazyLoadInstance.update();
    }

    setTimeout(function () {
        tips.removeClass("nice-popup-open");

        setTimeout(function () {
            setTimeout(function () {
                tips.remove();
            }, 500);
        }, 1000);
    }, 1500);
}

function ncPopup(type, html, maskStyle, btnCallBack) {
    var maskStyle = maskStyle ? 'style="' + maskStyle + '"' : "";

    var size = "";

    if (type == "big") {
        size = "nice-popup-lg";
    } else if (type == "no-padding") {
        size = "nice-popup-nopd";
    } else if (type == "cover") {
        size = "nice-popup-cover nice-popup-nopd";
    } else if (type == "full") {
        size = "nice-popup-xl";
    } else if (type == "scroll") {
        size = "nice-popup-scroll";
    } else if (type == "middle") {
        size = "nice-popup-md";
    } else if (type == "small") {
        size = "nice-popup-sm";
    }

    var template =
            '\
        <div class="nice-popup nice-popup-center ' +
            size +
            '">\
            <div class="nice-popup-overlay" ' +
            maskStyle +
            '></div>\
            <div class="nice-popup-body">\
                <div class="nice-popup-close">\
                    <span class="svg-white"></span>\
                    <span class="svg-dark"></span>\
                </div>\
                <div class="nice-popup-content">\
                    ' +
            html +
            "\
                </div>\
            </div>\
        </div>\
        ";

    var popup = $(template);
    $("body").append(popup);
    $("body").addClass("nice-popup-hidden");

    setTimeout(
        function () {
            popup.addClass("nice-popup-open");
        },

        300
    );

    if (typeof lazyLoadInstance !== "undefined") {
        lazyLoadInstance.update();
    }

    var close = function () {
        $("body").removeClass("nice-popup-hidden");
        $(popup).removeClass("nice-popup-open");

        setTimeout(function () {
            setTimeout(function () {
                popup.remove();
            }, 300);
        }, 600);
    };

    $(popup).on(
        "click touchstart",
        ".nice-popup-close, .nice-popup-overlay",
        function (event) {
            event.preventDefault();
            close();
        }
    );

    if (typeof btnCallBack == "object") {
        Object.keys(btnCallBack).forEach(function (key) {
            $(popup).on("click touchstart", key, function (event) {
                var ret = btnCallBack[key](event, close);
            });
        });
    }
    return popup;
}

class ResponsiveMenu {
    constructor(containerSelector, menuSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.menu = this.container.querySelector(menuSelector);
        this.moreMenu = null;
        this.options = Object.assign({
            padding: 40,
            moreLabel: "More",
            subMenuClass: "sub-menu",
        }, options);

        if (this.container && this.menu) {
            this.init();
        }
    }

    init() {
        this.adjustMenu();
        window.addEventListener("resize", () => this.adjustMenu());
    }

    createMoreMenu() {
        if (!this.moreMenu) {
            this.moreMenu = document.createElement("li");
            this.moreMenu.className = "menu-item menu-item-has-children";
            this.moreMenu.innerHTML = `<a href="#">${this.options.moreLabel}</a><ul class="${this.options.subMenuClass}"></ul>`;
            this.menu.appendChild(this.moreMenu);
        }
    }

    removeMoreMenu() {
        if (this.moreMenu) {
            this.moreMenu.remove();
            this.moreMenu = null;
        }
    }

    adjustMenu() {
        const containerWidth = this.container.offsetWidth - this.options.padding;
        const menuItems = Array.from(this.menu.children).filter((item) => item !== this.moreMenu);
        let currentWidth = 0;

        if (menuItems.length > 0) {
            this.createMoreMenu();
        }

        const moreSubMenu = this.moreMenu ? this.moreMenu.querySelector("ul") : null;

        if (moreSubMenu) {
            moreSubMenu.innerHTML = "";
        }

        menuItems.forEach((item) => (item.style.display = ""));

        menuItems.forEach((item) => {
            currentWidth += item.offsetWidth;

            if (currentWidth > containerWidth) {
                if (moreSubMenu) {
                    moreSubMenu.appendChild(item);
                }
            }
        });

        if (!moreSubMenu || moreSubMenu.children.length === 0) {
            this.removeMoreMenu();
        }
    }
}

new ResponsiveMenu(".navbar-collapse", ".navbar-site", {
    padding: 200,
    moreLabel: '更多',
    subMenuClass: "sub-menu",
});

/*
    site handleToc
    ----------------------------------------------------
*/
function handleToc() {
    if ($(".post-toc").length === 0) return;

    var headerEl = "h1,h2,h3,h4",
        content  = ".toc-class",
        idArr    = {};

    if ($(".post-content").find(headerEl).length === 0) {
        $(".scroll-toc").hide();
        return;
    }

    $(".post-content").find(headerEl).parent().addClass("toc-class");

    $(content).children(headerEl).each(function () {
        var headerId = $(this).text().replace(/[\s|\~|`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\：|\，|\。]/g,
            ""
        );

        headerId = headerId.toLowerCase();

        if (idArr[headerId]) {
            $(this).attr("id", headerId + "-" + idArr[headerId]);
            idArr[headerId]++;
        } else {
            idArr[headerId] = 1;
            $(this).attr("id", headerId);
        }
    });

    tocbot.init({
        tocSelector: ".post-toc",
        contentSelector: content,
        headingSelector: headerEl,
        positionFixedSelector: ".scroll-toc",
        isCollapsedClass: 'is-collapsed',
        collapsibleClass: 'is-collapsible',
        collapseDepth: 0,
        scrollSmooth: true,
        scrollSmoothDuration: 0,
        scrollSmoothOffset: -100,
        headingsOffset: 1,
    });
}

/*
    site handleTocToggle
    ----------------------------------------------------
*/
function handleTocToggle() {
    $('.toc-button').on('click', function (e) {
        e.preventDefault();

        var $scrollToc = $(this).closest('.scroll-toc');

        // 在 scroll-toc 上添加 active 类
        $scrollToc.toggleClass('active');
        if ($scrollToc.hasClass('is-position-fixed')) {
            $scrollToc.removeClass('active').toggleClass('close');
        }
    });

    $(window).on('scroll', function () {
        if ($(this).scrollTop() === 0) {
            var $scrollToc = $('.scroll-toc');
            if ($scrollToc.hasClass('active')) {
                $scrollToc.removeClass('active');
            }
            if ($scrollToc.hasClass('close')) {
                $scrollToc.removeClass('close');
            }
        }
    });
}

jQuery(document).ready(function ($) {
    handleToc();
    handleTocToggle();

    /*
        clipboard
        ----------------------------------------------------
        */
    if ($(".copy-permalink").length > 0) {
        var clipboard = new ClipboardJS(".copy-permalink");
        clipboard.on("success", function (e) {
            ncPopupTips(true, "已复制链接，快去分享给好友");
            e.clearSelection();
        });
        clipboard.on("error", function (e) {
            ncPopupTips(false, "复制失败，请稍后再试");
        });
    }
    /*
            site preloader
            ----------------------------------------------------
        */

    $(window).on("load", function () {
        if ($(".site-preloader").length) {
            $(".site-preloader").delay(200).fadeOut(300);
        }
    });

    /*
            site to top
            ----------------------------------------------------
        */
    if ($(".scroll-toolbar .toolbar-list").length > 0) {
        var stickyActions = $(".scroll-toolbar");
        var stickyActionsUl = $(".scroll-toolbar .toolbar-list");
        var postContent = $(".forum-post");

        var stickyActionsUlHeight = stickyActionsUl.height();
        var postContentTop = postContent.offset().top;
        var postContentBottom =
                postContentTop + postContent.height() - stickyActionsUlHeight;

        function updateStickyActions() {
            if (
                $(window).scrollTop() + stickyActionsUl.height() <
                postContentBottom
            ) {
                stickyActions.addClass("sticked");
            } else {
                stickyActions.removeClass("sticked");
            }
        }

        $(window).scroll(updateStickyActions);
    }

    var back_to_top = $(".totop-button");

    $(window).scroll(function () {
        if ($(window).scrollTop() > 300) {
            back_to_top.addClass("current");
        } else {
            back_to_top.removeClass("current");
        }
    });

    back_to_top.on("click", function (e) {
        e.preventDefault();
        $("html, body").animate({scrollTop: 0}, "300");
    });

    /*
            site background
            ----------------------------------------------------
        */

    if ($(".site-background").length) {
        $(window).on("scroll", function () {
            var scrollTop = $(this).scrollTop();
            var siteBackground = $(".site-background");

            if (scrollTop > 100) {
                siteBackground.css("opacity", "0");
            } else {
                siteBackground.css("opacity", "1");
            }
        });
    }

    /*
            site navbar
            ----------------------------------------------------
        */
    var $stickyNavbar = $(".site-navbar"),
        navbarHeight  = $stickyNavbar.innerHeight(),
        innerHeight   = window.innerHeight,
        mainHeight    = $("body").innerHeight() - navbarHeight * 2;

    $(window).scroll(function () {
        var amountScrolled = $(window).scrollTop();
        if (mainHeight > innerHeight) {
            if (amountScrolled <= navbarHeight) {
                $stickyNavbar.removeClass("is-sticky");
            } else {
                $stickyNavbar.addClass("is-sticky");
            }
        }
    });

    /*
            sidebar Sticky
            ----------------------------------------------------
        */
    if ($(".sidebar-left").length) {
        jQuery(".sidebar-left").each(function (e) {
            jQuery(this).theiaStickySidebar({
                additionalMarginTop: 80,
                minWidth: 768,
            });
        });
    }

    if ($(".sidebar-right").length) {
        jQuery(".sidebar-right").each(function (e) {
            jQuery(this).theiaStickySidebar({
                additionalMarginTop: 80,
                minWidth: 768,
            });
        });
    }

    /*
            AOS
            ----------------------------------------------------
        */
    AOS.init({
        once: true,
    });

    /*
            Fancybox
            ----------------------------------------------------
        */
    Fancybox.bind("[data-fancybox]", {
        Thumbs: false,
        Toolbar: {
            display: {
                left: ["infobar"],
                middle: ["zoomIn", "zoomOut", "toggle1to1", "rotateCCW", "rotateCW"],
                right: ["download", "close"],
            },
        },
        Carousel: {
            Panzoom: {
                decelFriction: 0.2,
            },
        },
        showClass: "f-fadeFastIn",
        hideClass: "f-fadeFastOut",
    });

    /*
          forum banner
          ----------------------------------------------------
        */
    if ($(".forum-banner").length) {
        new Swiper(".forum-banner .mySwiper", {
            slidesPerView: 1,
            loop: true,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
        });
    }

    /*
            forum category
            ----------------------------------------------------
        */
    if ($(".forum-category-info").length) {
        $(window).on("scroll", function () {
            var scrollTop = $(this).scrollTop();
            var siteBackground = $(".forum-category-info");

            if (scrollTop > 10) {
                siteBackground.addClass("close");
            } else {
                siteBackground.removeClass("close");
            }
        });
    }

    /*
          block auto scroll
          ----------------------------------------------------
        */

    if ($(".comments-block-list").length) {
        $(".comments-block-list ul").each(function (index) {
            var commentList = $(this);
            var commentItems = commentList.find("li");

            var totalWidth = 0;
            commentItems.each(function () {
                totalWidth += $(this).outerWidth(true);
            });

            var keyframes = `scroll-${index} { 0% { transform: translateX(0); } 100% { transform: translateX(-${totalWidth}px); } }`;

            $("style").append(`@keyframes ${keyframes}`);

            commentList.css({
                animation: `scroll-${index} ${10 + index * 2}s linear infinite`,
            });

            commentItems.hover(
                function () {
                    commentList.css("animation-play-state", "paused");
                },
                function () {
                    commentList.css("animation-play-state", "running");
                }
            );
        });
    }

    if ($(".announcement-list").length) {
        $(".announcement-list").each(function () {
            var $list = $(this);
            var listItemWidth = $list.find(".announcement-item").outerWidth(); // 获取单个项的宽度
            var listWidth = $list.width(); // 获取可见区域的宽度
            var scrollWidth = $list.prop("scrollWidth"); // 获取实际滚动宽度
            var currentScroll = 0;
            var scrollStep = 1;
            var scrollInterval;

            function scrollContent() {
                currentScroll += scrollStep; // 计算滚动位置
                $list.css("transform", "translateX(-" + currentScroll + "px)"); // 应用横向滚动效果

                // 如果滚动到底部，则返回起始位置
                if (currentScroll >= scrollWidth) {
                    currentScroll = 0;
                    $list.css("transform", "translateX(0)");
                }
            }

            // 鼠标悬停时停止滚动，鼠标移出时继续滚动
            $list.on("mouseenter", function () {
                clearInterval(scrollInterval);
            });

            $list.on("mouseleave", function () {
                scrollInterval = setInterval(scrollContent, 30);
            });

            // 初始化滚动
            scrollInterval = setInterval(scrollContent, 30);
        });
    }

    /*
          mobile menu sub dropdown
          ----------------------------------------------------
        */
    $(document).on("click", ".aside-menu .sub-pointer", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $this = jQuery(this);
        if ($this.hasClass("is-active")) {
            $this
            .removeClass("is-active")
            .closest("a")
            .siblings(".sub-menu")
            .slideUp("fast");
        } else {
            $this
            .addClass("is-active")
            .closest("a")
            .siblings(".sub-menu")
            .slideDown("fast");
            $this
            .closest(".menu-item")
            .siblings()
            .find(".sub-pointer")
            .removeClass("is-active");
            $this.closest(".menu-item").siblings().find(".sub-menu").slideUp("fast");
        }
    });

    /*
          site aside toggle
          ----------------------------------------------------
        */
    $body = $("body");
    $aside = $(".mobile-aside");
    $overflow = $(".aside-overlay");
    $toggle_button = $(".mobile-aside-toggle");
    $toggle_button.click(function (event) {
        event.preventDefault();
        $body.toggleClass("site-overflow");
        $aside.toggleClass("open");
    });

    $overflow.click(function (event) {
        event.preventDefault();
        $body.removeClass("site-overflow");
        $aside.removeClass("open");
    });

    /*
            Wechat popup
            ----------------------------------------------------
        */
    $(document).on("click", ".wechat-popup", function (event) {
        event.preventDefault();
        var img = $(this).data("img");
        var html =
                '<div class="text-center"> \
                        <img src="' +
                img +
                '" style="width:100%;height:auto;">\
                        </div>';
        ncPopup("small", html);
    });

    /*
    Moment Video Autoplay
    ----------------------------------------------------
    */
    var videos = document.getElementsByClassName("moment-video");

    function generateRandomId() {
        var chars =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var idLength = 8;
        var randomId = "";

        for (var i = 0; i < idLength; i++) {
            var randomIndex = Math.floor(Math.random() * chars.length);
            randomId += chars.charAt(randomIndex);
        }

        return randomId;
    }

    window.playVideo = function (videoId) {
        var currentVideo = document.getElementById(videoId);
        for (var i = 0; i < videos.length; i++) {
            if (videos[i] !== currentVideo) {
                videos[i].pause();
                videos[i].controls = false;
                videos[i].parentNode.getElementsByClassName(
                    "play-button"
                )[0].style.display = "flex";
            }
        }
        currentVideo.play();
        currentVideo.controls = true;
        currentVideo.parentNode.getElementsByClassName(
            "play-button"
        )[0].style.display = "none";
    }

    for (var i = 0; i < videos.length; i++) {
        var videoId = generateRandomId();
        videos[i].id = videoId;
        var playButton = videos[i].parentNode
        .getElementsByClassName("play-button")[0];
        if (playButton) {
            playButton.setAttribute("onclick", "playVideo('" + videoId + "')");
        }
    }

    function pauseVideo(videoId) {
        var currentVideo = document.getElementById(videoId);
        currentVideo.pause();
        currentVideo.controls = false;
        currentVideo.parentNode.getElementsByClassName(
            "play-button"
        )[0].style.display = "flex";
    }

    window.addEventListener("scroll", function () {
        for (var i = 0; i < videos.length; i++) {
            videos[i].pause();
            videos[i].controls = false;
            videos[i].parentNode.getElementsByClassName(
                "play-button"
            )[0].style.display = "flex";
        }
    });
});

document.addEventListener("alpine:init", () => {
    Alpine.data("colorSchemeSwitcher", () => ({
        currentValue: localStorage.getItem("color-scheme") || "auto",
        schemes: [
            {
                value: "light",
                label: "浅色模式",
                icon: "icon-sun_line1",
            },
            {
                value: "dark",
                label: "深色模式",
                icon: "icon-moon_line",
            },
            {
                value: "auto",
                label: "跟随系统",
                icon: "icon-palette_line",
            },
        ],
        get currentScheme() {
            return this.schemes.find((s) => s.value === this.currentValue);
        },
        init() {
            const saved = localStorage.getItem("color-scheme") || "auto";
            this.setScheme(saved, false);
            window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", () => {
                if (this.currentValue === "auto") {
                    this.applyScheme("auto");
                }
            });
        },
        setScheme(value, persist = true) {
            this.currentValue = value;
            this.applyScheme(value);
            if (persist) {
                localStorage.setItem("color-scheme", value);
            }
        },
        applyScheme(value) {
            const body = document.body;
            if (value === "auto") {
                const isDark = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;
                body.setAttribute("data-scheme", "auto");
            } else {
                body.setAttribute("data-scheme", value);
            }
        },
    }));

    Alpine.data("dropdown", () => ({
        show: false,
        open() {
            this.show = true;
        },
        close() {
            this.show = false;
        },
    }));
});
