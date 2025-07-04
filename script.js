document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    // ===================================
    // অ্যাপের কেন্দ্রীয় স্টেট এবং সেটিংস
    // ===================================
    const appState = {
        currentPage: 'home',
        userData: {
            id: tg.initDataUnsafe.user?.id || 12345,
            firstName: tg.initDataUnsafe.user?.first_name || "Guest",
            balance: 0.00,
            referrals: 0,
            isBlocked: false,
        },
        settings: {
            appName: "CashNet",
            appLogoUrl: "https://i.ibb.co/3zdVvjB/cashnet-logo.png", // আপনার লোগোর URL এখানে দিন
            botUsername: "YOUR_BOT_USERNAME", // আপনার বটের ইউজারনেম
            withdrawLimit: {
                balance: 1000,
                referrals: 20
            },
            tasks: [
                {
                    id: 'task_monetag_direct',
                    title: 'Monetag লিঙ্ক ভিজিট',
                    description: 'নতুন অফার দেখুন এবং আয় করুন',
                    reward: 0.30,
                    icon: 'fa-link',
                    action: (task) => handleDirectLinkTask('https://otieu.com/4/9156891', task)
                },
                {
                    id: 'task_adsterra_direct',
                    title: 'Adsterra লিঙ্ক ভিজিট',
                    description: 'স্পেশাল অফার দেখে আয় করুন',
                    reward: 0.35,
                    icon: 'fa-star',
                    action: (task) => handleDirectLinkTask('https://amuletshaped.com/xmy5jz0v?key=4bff42bbba1a2dd0e034d406ae638704', task)
                },
                {
                    id: 'task_advirtika_direct',
                    title: 'Advirtika লিঙ্ক ভিজিট',
                    description: 'লিঙ্ক ভিজিট করে আয় করুন',
                    reward: 0.25,
                    icon: 'fa-external-link-alt',
                    action: (task) => handleDirectLinkTask('https://data852.click/c216ade659fc1eb4f0a6/dcddaea166/?placementName=default', task)
                },
                // আপনি চাইলে নিচে Monetag SDK-এর কাজগুলোও রাখতে পারেন
                // {
                //     id: 'task_monetag_rewarded_popup',
                //     title: 'রিওয়ার্ডেড পপ-আপ দেখুন',
                //     description: 'একটি পপ-আপ বিজ্ঞাপন দেখে আয় করুন',
                //     reward: 0.75,
                //     icon: 'fa-window-maximize',
                //     action: (task) => {
                //         show_9182101('pop').then(() => giveReward(task.reward))
                //             .catch(e => tg.showAlert("দুঃখিত, বিজ্ঞাপনটি দেখানো যাচ্ছে না।"));
                //     }
                // }
            ]
        }
    };

    const mainContent = document.getElementById('main-content');
    
    // ===================================
    // পেইজ রেন্ডার করার ফাংশন
    // ===================================
    const pages = {
        home: () => {
            const { balance, referrals } = appState.userData;
            const { balance: balanceLimit, referrals: refLimit } = appState.settings.withdrawLimit;
            const balanceProgress = Math.min((balance / balanceLimit) * 100, 100);
            const referralProgress = Math.min((referrals / refLimit) * 100, 100);
            return `
                <div class="page" id="page-home">
                    <header class="header">
                        <img src="${appState.settings.appLogoUrl}" alt="App Logo" class="app-logo">
                        <h2 id="welcome-message">স্বাগতম, ${appState.userData.firstName}</h2>
                    </header>
                    <div class="card stats-grid">
                        <div class="stat-card">
                            <i class="fas fa-wallet icon"></i>
                            <p>বর্তমান ব্যালেন্স</p>
                            <h3>৳ ${balance.toFixed(2)}</h3>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-users icon"></i>
                            <p>মোট রেফারেল</p>
                            <h3>${referrals} জন</h3>
                        </div>
                    </div>
                    <div class="card goal-card">
                        <h4>উইথড্র করার অগ্রগতি</h4>
                        <div class="progress-item">
                            <label>ব্যালেন্স (লক্ষ্য: ৳ ${balanceLimit})</label>
                            <div class="progress-bar-container"><div class="progress-bar" style="width: ${balanceProgress}%;"></div></div>
                        </div>
                        <div class="progress-item">
                            <label>রেফারেল (লক্ষ্য: ${refLimit} জন)</label>
                            <div class="progress-bar-container"><div class="progress-bar" style="width: ${referralProgress}%;"></div></div>
                        </div>
                    </div>
                </div>
            `;
        },
        tasks: () => {
            let taskItems = appState.settings.tasks.map(task => `
                <div class="task-item">
                    <i class="fas ${task.icon} icon"></i>
                    <div class="task-details">
                        <h4>${task.title}</h4>
                        <p>${task.description}</p>
                    </div>
                    <button class="task-btn" data-task-id="${task.id}">শুরু করুন</button>
                </div>
            `).join('');
            return `<div class="page card" id="page-tasks"><h2>কাজসমূহ</h2>${taskItems}</div>`;
        },
        referral: () => {
            const refLink = `https://t.me/${appState.settings.botUsername}?start=${appState.userData.id}`;
            return `<div class="page card" id="page-referral"><h2><i class="fas fa-share-alt"></i> রেফার করে আয় করুন</h2><p>আপনার বন্ধুদের এই লিঙ্কের মাধ্যমে আমন্ত্রণ জানান। সফল রেফারেলে আপনার আয় বাড়বে।</p><div class="input-group"><input type="text" id="referral-link" value="${refLink}" readonly></div><button id="copy-ref-link-btn" class="btn">লিঙ্ক কপি করুন</button></div>`;
        },
        withdraw: () => {
            const canWithdraw = appState.userData.balance >= appState.settings.withdrawLimit.balance && appState.userData.referrals >= appState.settings.withdrawLimit.referrals;
            const formHtml = `<div class="input-group"><select id="payment-method"><option value="bkash">বিকাশ</option><option value="nagad">নগদ</option></select></div><div class="input-group"><input type="tel" id="account-number" placeholder="আপনার অ্যাকাউন্ট নম্বর (পার্সোনাল)"></div><button id="submit-withdraw-btn" class="btn">অনুরোধ পাঠান</button>`;
            const noticeHtml = `<div class="notice">টাকা তোলার জন্য আপনার ন্যূনতম ৳ ${appState.settings.withdrawLimit.balance} ব্যালেন্স এবং ${appState.settings.withdrawLimit.referrals} জন রেফারেল প্রয়োজন।</div>`;
            return `<div class="page card" id="page-withdraw"><h2><i class="fas fa-wallet"></i> টাকা তুলুন</h2>${canWithdraw ? formHtml : noticeHtml}</div>`;
        },
        blocked: () => `<div class="page card"><div class="notice error"><h2><i class="fas fa-user-lock"></i> অ্যাকাউন্ট ব্লকড</h2><p>অ্যাপের নিয়ম লঙ্ঘনের জন্য আপনার অ্যাকাউন্টটি স্থায়ীভাবে ব্লক করা হয়েছে।</p></div></div>`
    };

    // ===================================
    // অ্যাপের মূল কার্যকারিতা
    // ===================================
    function handleDirectLinkTask(link, task) {
        tg.openLink(link);
        let countdown = 15;
        tg.MainButton.setText(`পুরস্কারের জন্য অপেক্ষা করুন (${countdown}s)`).show().disable();
        const interval = setInterval(() => {
            countdown--;
            tg.MainButton.setText(`পুরস্কারের জন্য অপেক্ষা করুন (${countdown}s)`);
            if (countdown <= 0) {
                clearInterval(interval);
                tg.MainButton.setText('✅ পুরস্কার সংগ্রহ করুন').enable();
            }
        }, 1000);
        const claimRewardHandler = () => {
            giveReward(task.reward);
            tg.MainButton.hide();
            tg.offEvent('mainButtonClicked', claimRewardHandler);
        };
        tg.onEvent('mainButtonClicked', claimRewardHandler);
    }
    
    function renderPage(pageId) {
        if (appState.userData.isBlocked) {
            mainContent.innerHTML = pages.blocked();
            return;
        }
        appState.currentPage = pageId;
        mainContent.innerHTML = pages[pageId]();
        attachEventListeners(pageId);
    }
    
    function attachEventListeners(pageId) {
        if (pageId === 'tasks') {
            document.querySelectorAll('.task-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const taskId = e.target.dataset.taskId;
                    const task = appState.settings.tasks.find(t => t.id === taskId);
                    if (task) task.action(task);
                });
            });
        }
        if (pageId === 'referral') document.getElementById('copy-ref-link-btn').addEventListener('click', copyReferralLink);
        if (pageId === 'withdraw') {
            const btn = document.getElementById('submit-withdraw-btn');
            if (btn) btn.addEventListener('click', submitWithdrawRequest);
        }
    }

    function giveReward(amount) {
        appState.userData.balance += amount;
        tg.HapticFeedback.notificationOccurred('success');
        tg.showAlert(`অভিনন্দন! আপনি ৳ ${amount.toFixed(2)} পেয়েছেন।`);
        if (appState.currentPage === 'home') {
            renderPage('home');
        }
    }
    
    function copyReferralLink() { navigator.clipboard.writeText(document.getElementById('referral-link').value).then(() => { tg.HapticFeedback.notificationOccurred('success'); tg.showAlert('রেফারেল লিঙ্ক কপি করা হয়েছে!'); }); }
    function submitWithdrawRequest() { const method = document.getElementById('payment-method').value; const number = document.getElementById('account-number').value; if (!number || number.length < 11) { tg.showAlert('অনুগ্রহ করে সঠিক ১১-ডিজিটের অ্যাকাউন্ট নম্বর দিন।'); return; } tg.showAlert(`আপনার অনুরোধটি গ্রহণ করা হয়েছে। ২৪-৪৮ ঘণ্টার মধ্যে আপনার ${method} অ্যাকাউন্টে টাকা পাঠানো হবে।`); renderPage('home'); }

    // ===================================
    // অ্যাপ চালু করা
    // ===================================
    async function init() {
        // TODO: এখানে fetch() দিয়ে ব্যাক-এন্ড থেকে আসল userData লোড করতে হবে
        appState.userData.balance = 250.50; // ডেমো ডেটা
        appState.userData.referrals = 12; // ডেমো ডেটা

        renderPage('home');
        document.getElementById('app-loader').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
    }

    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const pageId = e.currentTarget.dataset.page;
            document.querySelector('.nav-btn.active').classList.remove('active');
            e.currentTarget.classList.add('active');
            renderPage(pageId);
        });
    });

    init();
});