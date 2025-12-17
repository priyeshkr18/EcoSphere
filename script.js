/* =================================================================
   MODULE 1: VISUAL ENGINE (The "Glitter" Background)
   ================================================================= */
const ParticleEngine = {
    canvas: document.getElementById('particle-canvas'),
    ctx: null,
    particles: [],
    
    init() {
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createParticles();
        this.animate();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    createParticles() {
        // Adjust density: Higher divider = fewer particles
        const count = (this.canvas.width * this.canvas.height) / 9000;
        this.particles = [];
        for(let i=0; i<count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5, // Velocity X
                vy: (Math.random() - 0.5) * 0.5, // Velocity Y
                size: Math.random() * 2 + 0.5,
                color: Math.random() > 0.5 ? '#10b981' : '#0f766e' // Emerald / Teal
            });
        }
    },

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            
            // Bounce off edges
            if(p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            
            // Draw Star (Particle)
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });

        // Draw Connections (Constellations)
        this.particles.forEach((a, i) => {
            for(let j=i+1; j<this.particles.length; j++) {
                const b = this.particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = dx*dx + dy*dy;
                
                // If close enough, draw line
                if(dist < 15000) {
                    this.ctx.strokeStyle = `rgba(16,185,129,${0.1 - dist/150000})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x, a.y);
                    this.ctx.lineTo(b.x, b.y);
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
};

/* =================================================================
   MODULE 2: USER DATA & HISTORY
   ================================================================= */
const UserProfile = {
    currentFootprint: 0,
    history: [], 
    
    init() {
        // Mock Data: Past 6 Months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        this.history = months.map(m => ({
            month: m,
            val: (Math.random() * 3 + 3).toFixed(2)
        }));
        this.renderHistoryChart();
    },

    addEntry(val) {
        this.currentFootprint = parseFloat(val);
        // Trigger Gamification Check
        Gamification.check(this.currentFootprint);
        // Add to history list (simulation)
        this.history.push({ month: 'Jul', val: val });
        this.renderHistoryChart(); 
    },

    renderHistoryChart() {
        const ctx = document.getElementById('historyChart').getContext('2d');
        if(window.myHistoryChart) window.myHistoryChart.destroy();

        window.myHistoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.history.map(h => h.month),
                datasets: [{
                    label: 'Carbon Footprint (Tons)',
                    data: this.history.map(h => h.val),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8'} },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8'} }
                }
            }
        });
    }
};

/* =================================================================
   MODULE 3: GAMIFICATION (Badges & Trophy)
   ================================================================= */
const Gamification = {
    NATIONAL_AVG: 4.7, // Tons
    badgesList: [
        { id: 'b1', name: 'First Step', icon: 'fa-shoe-prints', desc: 'Calculated first footprint', unlocked: true },
        { id: 'b2', name: 'Eco Warrior', icon: 'fa-leaf', desc: 'Below 4.0 Tons', unlocked: false },
        { id: 'b3', name: 'Zero Hero', icon: 'fa-solar-panel', desc: 'Below 2.0 Tons', unlocked: false }
    ],

    check(score) {
        // Trophy Logic
        const trophyCase = document.getElementById('trophy-case');
        if (score < this.NATIONAL_AVG) {
            trophyCase.innerHTML = `
                <div class="text-center animate-float">
                    <i class="fa-solid fa-trophy text-5xl text-yellow-400 trophy-glow mb-2"></i>
                    <p class="text-xs text-yellow-200 font-bold">Carbon Champion</p>
                    <p class="text-[10px] text-gray-400">Below National Avg</p>
                </div>
            `;
            // Open Modal
            document.getElementById('trophy-modal').classList.remove('hidden');
        } else {
            trophyCase.innerHTML = `<p class="text-xs text-gray-500">Reduce to < ${this.NATIONAL_AVG} tons to unlock trophy.</p>`;
        }

        // Badge Logic
        if(score < 4.0) this.unlockBadge('b2');
        if(score < 2.0) this.unlockBadge('b3');
        this.renderBadges();
    },

    unlockBadge(id) {
        const badge = this.badgesList.find(b => b.id === id);
        if(badge) badge.unlocked = true;
    },

    renderBadges() {
        const grid = document.getElementById('badges-grid');
        grid.innerHTML = this.badgesList.map(b => `
            <div class="text-center group">
                <div class="badge-hexagon ${b.unlocked ? 'border-emerald-500' : 'badge-locked'}">
                    <i class="fa-solid ${b.icon} ${b.unlocked ? 'text-white' : 'text-gray-500'} text-xl"></i>
                </div>
                <p class="mt-2 text-xs font-bold ${b.unlocked ? 'text-emerald-400' : 'text-gray-600'}">${b.name}</p>
            </div>
        `).join('');
    },

    closeModal() {
        document.getElementById('trophy-modal').classList.add('hidden');
    }
};

/* =================================================================
   MODULE 4: COMMUNITY & SOCIAL
   ================================================================= */
const Community = {
    posts: [
        { user: 'Sarah J.', time: '2h ago', content: 'Just switched to 100% solar! My projected footprint dropped by 2 tons.', likes: 24 },
        { user: 'System', time: '4h ago', content: 'Tip: Unplugging "vampire devices" can save 10% on energy bills.', likes: 115 }
    ],

    init() {
        this.renderFeed();
    },

    addPost() {
        const input = document.getElementById('post-input');
        if(!input.value.trim()) return;

        const newPost = {
            user: 'You',
            time: 'Just now',
            content: input.value,
            likes: 0
        };
        
        this.posts.unshift(newPost); // Add to top
        input.value = '';
        this.renderFeed();
    },

    sharePost(platform, content) {
        let url = '';
        const text = encodeURIComponent(content + " #EcoSphere #Sustainability");
        if(platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, '_blank');
    },

    renderFeed() {
        const container = document.getElementById('feed-stream');
        container.innerHTML = this.posts.map(p => `
            <div class="glass-card p-4 rounded-2xl feed-card">
                <div class="flex gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-gray-400">
                        ${p.user.charAt(0)}
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-sm text-white">${p.user}</h4>
                            <span class="text-xs text-gray-500">${p.time}</span>
                        </div>
                        <p class="text-sm text-gray-300 mt-1">${p.content}</p>
                        <div class="flex gap-4 mt-3 pt-3 border-t border-white/5 text-gray-400 text-xs">
                            <button class="hover:text-emerald-400"><i class="fa-regular fa-heart"></i> ${p.likes}</button>
                            <button class="hover:text-blue-400"><i class="fa-regular fa-comment"></i> Comment</button>
                            <button class="hover:text-white ml-auto" onclick="Community.sharePost('twitter', '${p.content}')">
                                <i class="fa-brands fa-x-twitter"></i> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

/* =================================================================
   MAIN APP LOGIC
   ================================================================= */
// 1. Initialize Particles Immediately
ParticleEngine.init();

// 2. Auth Handling
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> ACCESSING GRID...';
    
    setTimeout(() => {
        document.getElementById('view-auth').style.display = 'none';
        document.getElementById('app-wrapper').classList.remove('hidden');
        initializeApp();
    }, 1500);
});

function initializeApp() {
    UserProfile.init();
    Gamification.renderBadges();
    Community.init();
    updateClock();
    setInterval(updateClock, 1000);
}

// 3. Navigation
function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    
    // Update Tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active-nav', 'text-white');
        btn.classList.add('text-gray-400');
    });
    
    // Show Target
    const target = document.getElementById(`view-${viewId}`);
    target.classList.remove('hidden');
    
    // Highlight Tab
    // (Simplified logic: assumes button order matches viewId logic, or simple onclick usage)
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.textContent.toLowerCase().includes(viewId.replace('view-', '')));
    if(activeBtn) {
        activeBtn.classList.add('active-nav', 'text-white');
        activeBtn.classList.remove('text-gray-400');
    }
}

function logout() { location.reload(); }
function updateClock() { document.getElementById('live-clock').innerText = new Date().toLocaleTimeString(); }

// 4. Calculator Logic
const inputs = {
    elec: document.getElementById('inp-elec'),
    car: document.getElementById('inp-car'),
    flight: document.getElementById('inp-flight'),
    meat: document.getElementById('inp-meat')
};

// Update input labels
Object.keys(inputs).forEach(k => {
    inputs[k].addEventListener('input', (e) => {
        const units = { elec: ' kWh', car: ' km', flight: ' flights', meat: ' meals'};
        document.getElementById(`disp-${k}`).innerText = e.target.value + units[k];
    });
});

function calculateFootprint() {
    const valElec = inputs.elec.value * 12 * 0.5 / 1000;
    const valCar = inputs.car.value * 52 * 0.2 / 1000;
    const valFlight = inputs.flight.value * 300 / 1000;
    const valFood = inputs.meat.value * 52 * 2.0 / 1000;
    
    const total = (valElec + valCar + valFlight + valFood).toFixed(2);

    // Update Score UI
    const scoreCard = document.getElementById('score-card');
    scoreCard.classList.remove('opacity-50', 'pointer-events-none');
    document.getElementById('score-ring').classList.remove('animate-spin-slow');
    document.getElementById('result-number').innerText = total;

    // Send to Profile
    UserProfile.addEntry(total);

    // Show Legacy Section
    document.getElementById('legacy-section').classList.remove('hidden');

    // Typewriter
    const txt = "Trajectory: +2.4°C. Action required immediately.";
    let i = 0;
    document.getElementById('typewriter-text').innerHTML = "";
    function type() { if(i < txt.length) { document.getElementById('typewriter-text').innerHTML += txt.charAt(i); i++; setTimeout(type, 50); } }
    type();

    // Chart
    const ctx = document.getElementById('footprintChart').getContext('2d');
    if(window.mainChart) window.mainChart.destroy();
    window.mainChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Energy', 'Transport', 'Air', 'Food'],
            datasets: [{
                data: [valElec, valCar, valFlight, valFood],
                backgroundColor: ['#eab308', '#ef4444', '#3b82f6', '#f97316'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#fff' } } }
        }
    });
}