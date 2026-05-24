/* ============================================================
   BFM CHAT - script.js
   WhatsApp-style messaging with text, photos, and videos.
   All data stored in localStorage.

   SECTIONS:
   1.  App State & Constants
   2.  Demo Data (users, messages, media)
   3.  Auth System (login / register / logout)
   4.  App Initialization
   5.  Sidebar: Contact List
   6.  Conversation: Open, Close, Render
   7.  Messaging: Send Text, Send Media, Render Bubbles
   8.  Typing Indicator
   9.  Emoji Picker
   10. In-Chat Search
   11. Settings Panel
   12. Profile Modal
   13. Media Lightbox
   14. Notification Sound
   15. Toast Notifications
   16. Utility Helpers
   17. Startup
============================================================ */


/* ============================================================
   1. APP STATE & CONSTANTS
============================================================ */

// Currently logged-in user object
let currentUser = null;

// The contact the user is currently chatting with
let activeContact = null;

// Whether notification sounds are on
let soundOn = true;

// Typing simulation timer
let typingTimer = null;

// Emoji list for the picker
const EMOJI_LIST = [
  '😀','😂','🥹','😍','🤩','😎','🥳','😴','🤔','😤',
  '😭','😡','🥺','😏','🙃','🤗','😇','🫡','🤯','😱',
  '❤️','🔥','✨','💯','🎉','👍','👎','🙌','💪','👀',
  '🍕','🍔','☕','🎵','🎮','🎬','⚽','🏀','🌙','⭐',
  '💀','👻','🤖','🦄','🐱','🐶','🌸','🌊','🚀','💎',
  '😘','😜','🤪','🥰','🫶','🤝','✌️','🤙','👏','🫂',
];

// DiceBear avatar base URL (generates SVG avatars from a seed word)
const AVATAR_BASE = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

// Background colors for dicebear (cycles through for variety)
const BG_COLORS = ['b6e3f4','ffdfbf','c0aede','d1f4d1','ffd5dc','f4e0b6'];


/* ============================================================
   2. DEMO DATA
   Pre-built users and conversation histories.
   Loaded into localStorage on first run.
============================================================ */

// Demo user accounts (all passwords: 1234)
const DEMO_USERS = [
  { username:'alex',  password:'1234', avatar:`${AVATAR_BASE}alex&backgroundColor=b6e3f4`,  joined:'2024-01-10' },
  { username:'sarah', password:'1234', avatar:`${AVATAR_BASE}sarah&backgroundColor=ffdfbf`, joined:'2024-01-11' },
  { username:'mike',  password:'1234', avatar:`${AVATAR_BASE}mike&backgroundColor=c0aede`,  joined:'2024-01-12' },
  { username:'luna',  password:'1234', avatar:`${AVATAR_BASE}luna&backgroundColor=d1f4d1`,  joined:'2024-01-14' },
  { username:'jaden', password:'1234', avatar:`${AVATAR_BASE}jaden&backgroundColor=ffd5dc`, joined:'2024-01-15' },
  { username:'zara',  password:'1234', avatar:`${AVATAR_BASE}zara&backgroundColor=f4e0b6`,  joined:'2024-01-16' },
];

// Contacts visible for 'alex' (other users he chats with)
const DEMO_CONTACTS = ['sarah','mike','luna','jaden','zara'];

// Sample text conversations between alex and each contact.
// Format: { from: 'username', text: 'message', time: 'HH:MM' }
const DEMO_CONVERSATIONS = {
  'alex-sarah': [
    { from:'sarah', text:'Hey Alex! How are you doing? 😊', time:'09:00' },
    { from:'alex',  text:'Hey Sarah! I\'m doing great, thanks! You?', time:'09:01' },
    { from:'sarah', text:'Pretty good! Just finished my morning run 🏃', time:'09:02' },
    { from:'alex',  text:'Nice! How far did you go?', time:'09:03' },
    { from:'sarah', text:'About 5km. Felt amazing!', time:'09:04' },
    { from:'alex',  text:'Wow that\'s impressive 💪', time:'09:05' },
    { from:'sarah', text:'Haha thanks. Are you free this weekend?', time:'09:06' },
    { from:'alex',  text:'Yeah I should be. What\'s the plan?', time:'09:07' },
    { from:'sarah', text:'Thinking of going to the new coffee place downtown ☕', time:'09:08' },
    { from:'alex',  text:'Sounds perfect! Saturday afternoon?', time:'09:09' },
    { from:'sarah', text:'Deal! 🎉 Looking forward to it', time:'09:10' },
  ],
  'alex-mike': [
    { from:'mike',  text:'Bro did you watch the game last night?! 😤', time:'21:00' },
    { from:'alex',  text:'YES! That last minute goal was insane 🔥', time:'21:01' },
    { from:'mike',  text:'I literally jumped off my couch haha', time:'21:02' },
    { from:'alex',  text:'Same lol my neighbors probably hate me', time:'21:03' },
    { from:'mike',  text:'Worth it though. That was history', time:'21:04' },
    { from:'alex',  text:'100%. Are you watching the next one?', time:'21:05' },
    { from:'mike',  text:'Obviously. At my place this time?', time:'21:06' },
    { from:'alex',  text:'I\'m in 🙌 I\'ll bring snacks', time:'21:07' },
    { from:'mike',  text:'Perfect. See you Tuesday then!', time:'21:08' },
  ],
  'alex-luna': [
    { from:'luna',  text:'Alex did you read the new chapter yet?? 😱', time:'14:00' },
    { from:'alex',  text:'Which one? I\'m a bit behind on everything lol', time:'14:01' },
    { from:'luna',  text:'Blue Lock!! Chapter 268!', time:'14:02' },
    { from:'alex',  text:'Not yet!! Don\'t spoil it 😭', time:'14:03' },
    { from:'luna',  text:'Ok ok I won\'t. But READ IT ASAP', time:'14:04' },
    { from:'alex',  text:'Reading it now... OMG', time:'14:15' },
    { from:'luna',  text:'RIGHT?? 🔥🔥🔥', time:'14:16' },
    { from:'alex',  text:'That ending tho... I\'m not okay', time:'14:17' },
    { from:'luna',  text:'Same!! The next chapter can\'t come fast enough', time:'14:18' },
  ],
  'alex-jaden': [
    { from:'jaden', text:'Yo are you free for a Valorant session tonight?', time:'17:00' },
    { from:'alex',  text:'After 8pm yeah. My aim has been cracked lately 🎯', time:'17:01' },
    { from:'jaden', text:'Lmaoo sure it has 😂', time:'17:02' },
    { from:'alex',  text:'I\'m serious! You\'ll see', time:'17:03' },
    { from:'jaden', text:'Okay okay bet. Let\'s run it. I\'ll add you at 8', time:'17:04' },
    { from:'alex',  text:'GGs only 💪', time:'17:05' },
    { from:'jaden', text:'Nah I\'m going full sweat mode lol', time:'17:06' },
    { from:'alex',  text:'Oh it\'s on then 😤', time:'17:07' },
  ],
  'alex-zara': [
    { from:'zara',  text:'Hi! I just joined this app. Testing 123 😄', time:'10:00' },
    { from:'alex',  text:'Hey Zara! Welcome! Great to see you here', time:'10:01' },
    { from:'zara',  text:'Thanks! This interface looks really clean', time:'10:02' },
    { from:'alex',  text:'Right? It\'s called BFM Chat', time:'10:03' },
    { from:'zara',  text:'Love the dark theme ✨', time:'10:04' },
    { from:'alex',  text:'Same! Easier on the eyes at night too', time:'10:05' },
    { from:'zara',  text:'Can we share photos here too?', time:'10:06' },
    { from:'alex',  text:'Yep! Just tap the paperclip icon 📎', time:'10:07' },
    { from:'zara',  text:'Amazing! Will definitely use this more', time:'10:08' },
  ],
};

// Sample photo URLs for demo media messages
// Using placeholder images that load fast (picsum.photos)
const DEMO_PHOTOS = [
  'https://picsum.photos/seed/bfm1/400/300',
  'https://picsum.photos/seed/bfm2/400/280',
  'https://picsum.photos/seed/bfm3/380/300',
];


/* ============================================================
   3. AUTH SYSTEM
============================================================ */

/**
 * Switches between login and register forms on the auth screen.
 * @param {string} tab - 'login' or 'register'
 */
function switchAuthTab(tab) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('shown'));
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`form-${tab}`).classList.add('shown');
  document.getElementById(`tab-${tab}-btn`).classList.add('active');
  // Clear error messages when switching
  document.getElementById('login-err').textContent = '';
  document.getElementById('reg-err').textContent = '';
}

/**
 * Returns all users from localStorage.
 * @returns {Array}
 */
function getUsers() {
  return JSON.parse(localStorage.getItem('bfm2_users') || '[]');
}

/**
 * Saves the users array to localStorage.
 * @param {Array} users
 */
function saveUsers(users) {
  localStorage.setItem('bfm2_users', JSON.stringify(users));
}

/**
 * Handles the login form submission.
 * Validates credentials against stored users.
 */
function doLogin() {
  const username = document.getElementById('l-username').value.trim();
  const password = document.getElementById('l-password').value;
  const errEl = document.getElementById('login-err');

  if (!username || !password) { errEl.textContent = 'Please fill in all fields.'; return; }

  const users = getUsers();
  const user = users.find(u =>
    u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!user) { errEl.textContent = 'Wrong username or password.'; return; }

  // Save session and launch app
  localStorage.setItem('bfm2_session', JSON.stringify(user));
  currentUser = user;
  launchApp();
}

/**
 * Handles the register form submission.
 * Creates a new user account if username is not taken.
 */
function doRegister() {
  const username = document.getElementById('r-username').value.trim();
  const password = document.getElementById('r-password').value;
  const avatarUrl = document.getElementById('r-avatar').value.trim();
  const errEl = document.getElementById('reg-err');

  if (!username || !password)  { errEl.textContent = 'Username and password are required.'; return; }
  if (username.length < 3)     { errEl.textContent = 'Username must be at least 3 characters.'; return; }
  if (password.length < 4)     { errEl.textContent = 'Password must be at least 4 characters.'; return; }

  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    errEl.textContent = 'That username is already taken.';
    return;
  }

  // Build new user
  const newUser = {
    username,
    password,
    avatar: avatarUrl || `${AVATAR_BASE}${username}&backgroundColor=${BG_COLORS[users.length % BG_COLORS.length]}`,
    joined: new Date().toISOString().slice(0, 10),
  };

  users.push(newUser);
  saveUsers(users);

  localStorage.setItem('bfm2_session', JSON.stringify(newUser));
  currentUser = newUser;
  showToast(`Welcome, ${username}! 🎉`);
  launchApp();
}

/**
 * Logs out the current user. Clears session and returns to auth screen.
 */
function doLogout() {
  localStorage.removeItem('bfm2_session');
  currentUser = null;
  activeContact = null;

  // Reset UI
  document.getElementById('app').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('l-username').value = '';
  document.getElementById('l-password').value = '';
  hideSettings();
  showToast('Logged out. See you soon! 👋');
}


/* ============================================================
   4. APP INITIALIZATION
============================================================ */

/**
 * Seeds demo users and conversations on first launch.
 * Only runs once — data is preserved across page refreshes.
 */
function seedDemoData() {
  const users = getUsers();
  const existing = users.map(u => u.username.toLowerCase());

  // Add demo users that don't already exist
  DEMO_USERS.forEach(u => {
    if (!existing.includes(u.username.toLowerCase())) users.push(u);
  });
  saveUsers(users);

  // Seed conversations (only if not already present)
  Object.entries(DEMO_CONVERSATIONS).forEach(([key, msgs]) => {
    const storageKey = `bfm2_conv_${key}`;
    if (!localStorage.getItem(storageKey)) {
      // Build message objects with full structure
      const built = msgs.map((m, i) => ({
        id:     Date.now() + i,
        from:   m.from,
        type:   'text',
        text:   m.text,
        time:   m.time,
        avatar: `${AVATAR_BASE}${m.from}`,
      }));
      localStorage.setItem(storageKey, JSON.stringify(built));
    }
  });

  // Add one demo photo to alex-sarah conversation
  const photoKey = 'bfm2_conv_alex-sarah';
  const existingMsgs = JSON.parse(localStorage.getItem(photoKey) || '[]');
  // Only add if no media messages exist yet
  if (!existingMsgs.some(m => m.type === 'image')) {
    existingMsgs.push({
      id:     Date.now() + 999,
      from:   'sarah',
      type:   'image',
      src:    DEMO_PHOTOS[0],
      caption:'Beautiful view from this morning 🌅',
      time:   '09:11',
      avatar: `${AVATAR_BASE}sarah`,
    });
    localStorage.setItem(photoKey, JSON.stringify(existingMsgs));
  }
}

/**
 * Launches the main app after successful login.
 * Hides auth, shows app, populates all UI.
 */
function launchApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Seed demo data on first run
  seedDemoData();

  // Update sidebar with current user info
  updateSidebarProfile();

  // Build contact list
  renderContactList();

  // Load settings UI
  loadSettingsUI();

  // Build emoji picker
  buildEmojiPicker();
}

/**
 * Updates the sidebar profile bar with current user's name and avatar.
 */
function updateSidebarProfile() {
  const avatarSrc = currentUser.avatar || `${AVATAR_BASE}${currentUser.username}`;
  document.getElementById('sb-avatar').src = avatarSrc;
  document.getElementById('sb-username').textContent = currentUser.username;
  document.getElementById('set-avatar-img').src = avatarSrc;
}


/* ============================================================
   5. SIDEBAR: CONTACT LIST
============================================================ */

/**
 * Gets the contacts list for the current user.
 * Returns the demo list for demo users, otherwise all other users.
 * @returns {Array} Array of user objects
 */
function getContacts() {
  const users = getUsers();
  const allOthers = users.filter(u => u.username !== currentUser.username);

  // For demo user 'alex', use the curated contact list
  if (currentUser.username === 'alex') {
    return DEMO_CONTACTS
      .map(name => users.find(u => u.username === name))
      .filter(Boolean);
  }
  return allOthers;
}

/**
 * Gets the conversation key for two users (alphabetically sorted for consistency).
 * @param {string} a - Username 1
 * @param {string} b - Username 2
 * @returns {string} e.g. "alex-sarah"
 */
function convKey(a, b) {
  return [a, b].sort().join('-');
}

/**
 * Gets all messages between current user and a contact.
 * @param {string} contactUsername
 * @returns {Array}
 */
function getMessages(contactUsername) {
  const key = `bfm2_conv_${convKey(currentUser.username, contactUsername)}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/**
 * Saves messages for a conversation.
 * @param {string} contactUsername
 * @param {Array} messages
 */
function saveMessages(contactUsername, messages) {
  const key = `bfm2_conv_${convKey(currentUser.username, contactUsername)}`;
  localStorage.setItem(key, JSON.stringify(messages));
}

/**
 * Renders (or re-renders) the contact list in the sidebar.
 * @param {string} [filter=''] - Optional search string to filter contacts
 */
function renderContactList(filter = '') {
  const contacts = getContacts();
  const list = document.getElementById('contact-list');
  list.innerHTML = '';

  const query = filter.toLowerCase().trim();

  contacts.forEach(contact => {
    // Filter by search query
    if (query && !contact.username.toLowerCase().includes(query)) return;

    const msgs = getMessages(contact.username);
    const lastMsg = msgs[msgs.length - 1];

    // Build preview text for the contact row
    let preview = 'Start a conversation';
    if (lastMsg) {
      if (lastMsg.type === 'image')  preview = '📷 Photo';
      else if (lastMsg.type === 'video') preview = '🎥 Video';
      else preview = lastMsg.text;
    }

    // Unread count: messages from contact (not read = simplified: last N if contact sent last)
    const unread = msgs.filter(m => m.from === contact.username && !m.read).length;

    const item = document.createElement('div');
    item.className = `contact-item${activeContact?.username === contact.username ? ' active' : ''}`;
    item.dataset.username = contact.username;

    item.innerHTML = `
      <div class="contact-avatar-wrap">
        <img src="${contact.avatar || AVATAR_BASE + contact.username}"
             alt="${contact.username}" class="contact-avatar"
             onerror="this.src='${AVATAR_BASE}${contact.username}'" />
        <span class="online-dot"></span>
      </div>
      <div class="contact-info">
        <div class="contact-name-row">
          <span class="contact-name">${contact.username}</span>
          <span class="contact-time">${lastMsg ? lastMsg.time : ''}</span>
        </div>
        <div class="contact-preview-row">
          <span class="contact-preview">${escapeHTML(preview)}</span>
          ${unread > 0 ? `<span class="contact-unread-badge">${unread}</span>` : ''}
        </div>
      </div>
    `;

    item.addEventListener('click', () => openConversation(contact));
    list.appendChild(item);
  });

  // Empty state if search finds nothing
  if (!list.children.length) {
    list.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:24px;font-size:14px;">No contacts found</p>`;
  }
}

/**
 * Filters the contact list based on the search input.
 * @param {string} query
 */
function filterContacts(query) {
  renderContactList(query);
}


/* ============================================================
   6. CONVERSATION: OPEN, CLOSE, RENDER
============================================================ */

/**
 * Opens a conversation with the given contact.
 * Updates the chat panel header and loads messages.
 * @param {Object} contact - User object
 */
function openConversation(contact) {
  activeContact = contact;

  // On mobile, add class to show chat panel
  document.getElementById('app').classList.add('chat-open');

  // Show conversation, hide empty state
  document.getElementById('chat-empty').classList.add('hidden');
  document.getElementById('conversation').classList.remove('hidden');

  // Update chat topbar
  const avatarSrc = contact.avatar || `${AVATAR_BASE}${contact.username}`;
  document.getElementById('ct-avatar').src = avatarSrc;
  document.getElementById('ct-name').textContent = contact.username;
  document.getElementById('ct-status').textContent = 'online';

  // Mark messages as read
  const msgs = getMessages(contact.username);
  msgs.forEach(m => { if (m.from === contact.username) m.read = true; });
  saveMessages(contact.username, msgs);

  // Render messages
  renderMessages(msgs);

  // Highlight active contact in sidebar
  document.querySelectorAll('.contact-item').forEach(el => {
    el.classList.toggle('active', el.dataset.username === contact.username);
  });

  // Update contact list (to clear unread badge)
  renderContactList();

  // Focus input
  document.getElementById('msg-input').focus();
}

/**
 * Closes the active conversation (mobile: slides back to sidebar).
 */
function closeConversation() {
  document.getElementById('app').classList.remove('chat-open');
  activeContact = null;
  document.getElementById('conversation').classList.add('hidden');
  document.getElementById('chat-empty').classList.remove('hidden');
}

/**
 * Renders all messages in the messages container.
 * @param {Array} messages
 */
function renderMessages(messages) {
  const wrap = document.getElementById('messages-wrap');
  wrap.innerHTML = '';

  if (!messages.length) {
    wrap.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--text-muted);">
        <div style="font-size:40px;margin-bottom:12px;">💬</div>
        <p style="font-size:14px;">Say hello to ${activeContact.username}!</p>
      </div>`;
    return;
  }

  // Add a date header at the top
  const dateDivider = document.createElement('div');
  dateDivider.className = 'date-divider';
  dateDivider.innerHTML = '<span>Today</span>';
  wrap.appendChild(dateDivider);

  // Render each message
  messages.forEach(msg => {
    wrap.appendChild(buildMessageEl(msg));
  });

  scrollToBottom();
}

/**
 * Builds a single message DOM element.
 * Handles text, image, and video types.
 * @param {Object} msg - Message object
 * @returns {HTMLElement}
 */
function buildMessageEl(msg) {
  const isOwn = (msg.from === currentUser.username);
  const avatarSrc = msg.avatar || `${AVATAR_BASE}${msg.from}`;

  const row = document.createElement('div');
  row.className = `msg-row ${isOwn ? 'sent' : 'received'}`;
  row.dataset.text = (msg.text || '').toLowerCase(); // For in-chat search

  // Avatar (only shown for received messages)
  const avatarHTML = isOwn ? '' : `
    <img src="${avatarSrc}" alt="${msg.from}" class="msg-av"
         onclick="openContactProfile()"
         onerror="this.src='${AVATAR_BASE}${msg.from}'" />`;

  // Build message bubble content based on type
  let bubbleContent = '';

  if (msg.type === 'image') {
    // IMAGE MESSAGE
    bubbleContent = `
      <div class="msg-media-wrap" onclick="openLightbox('image', '${msg.src}')">
        <img src="${msg.src}" alt="photo"
             onerror="this.src='https://picsum.photos/seed/fallback/400/300'" />
      </div>
      ${msg.caption ? `<p class="media-caption">${escapeHTML(msg.caption)}</p>` : ''}
    `;
  } else if (msg.type === 'video') {
    // VIDEO MESSAGE
    bubbleContent = `
      <div class="msg-media-wrap" onclick="openLightbox('video', '${msg.src}')">
        <video src="${msg.src}" preload="metadata"></video>
        <div class="video-overlay"><i class="fa-solid fa-play"></i></div>
      </div>
      ${msg.caption ? `<p class="media-caption">${escapeHTML(msg.caption)}</p>` : ''}
    `;
  } else {
    // TEXT MESSAGE
    bubbleContent = `<span>${escapeHTML(msg.text)}</span>`;
  }

  // Timestamps + read ticks (double checkmark for sent messages)
  const ticksHTML = isOwn
    ? `<span class="msg-ticks"><i class="fa-solid fa-check-double"></i></span>`
    : '';

  row.innerHTML = `
    ${avatarHTML}
    <div class="msg-group">
      ${!isOwn ? `<span class="msg-sender">${msg.from}</span>` : ''}
      <div class="msg-bubble">
        ${bubbleContent}
        <div class="msg-meta">
          <span class="msg-time">${msg.time}</span>
          ${ticksHTML}
        </div>
      </div>
    </div>
  `;

  return row;
}

/**
 * Scrolls the messages container to the bottom.
 */
function scrollToBottom() {
  const wrap = document.getElementById('messages-wrap');
  setTimeout(() => { wrap.scrollTop = wrap.scrollHeight; }, 60);
}


/* ============================================================
   7. MESSAGING: SEND TEXT, SEND MEDIA
============================================================ */

/**
 * Handles the Enter key in the message input.
 * Enter = send, Shift+Enter = new line (default).
 * @param {KeyboardEvent} e
 */
function onInputKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
  // Close emoji panel on Escape
  if (e.key === 'Escape') closeEmoji();
}

/**
 * Handles typing event in the input (could be used for typing indicators).
 */
function onInputChange() {
  // Could broadcast "typing" state here in a real-time app
}

/**
 * Sends the current text in the message input as a message.
 */
function sendMessage() {
  if (!activeContact) return;

  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;

  // Build message object
  const msg = {
    id:     Date.now(),
    from:   currentUser.username,
    type:   'text',
    text,
    time:   getTime(),
    avatar: currentUser.avatar || `${AVATAR_BASE}${currentUser.username}`,
    read:   false,
  };

  // Save to storage
  const msgs = getMessages(activeContact.username);
  msgs.push(msg);
  saveMessages(activeContact.username, msgs);

  // Append to UI
  const wrap = document.getElementById('messages-wrap');
  wrap.appendChild(buildMessageEl(msg));
  scrollToBottom();

  // Clear input
  input.value = '';

  // Play sent sound
  playSoundSent();

  // Refresh contact list to update preview
  renderContactList();

  // Simulate a reply from the contact
  simulateIncomingReply();
}

/**
 * Handles media file uploads (photos and videos).
 * Reads file as base64, saves to localStorage, and renders.
 * @param {Event} e - Change event from file input
 */
function handleMediaUpload(e) {
  if (!activeContact) {
    showToast('Open a conversation first!');
    return;
  }

  const file = e.target.files[0];
  if (!file) return;

  // Check file size (warn if > 5MB to avoid localStorage overflow)
  if (file.size > 5 * 1024 * 1024) {
    showToast('File too large. Max 5MB for localStorage storage.');
    e.target.value = '';
    return;
  }

  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (!isVideo && !isImage) {
    showToast('Only images and videos are supported.');
    e.target.value = '';
    return;
  }

  // Read file as base64 data URL
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataSrc = ev.target.result; // base64 data URL

    const msg = {
      id:     Date.now(),
      from:   currentUser.username,
      type:   isImage ? 'image' : 'video',
      src:    dataSrc,
      caption:'',
      time:   getTime(),
      avatar: currentUser.avatar || `${AVATAR_BASE}${currentUser.username}`,
      read:   false,
    };

    // Save to storage
    const msgs = getMessages(activeContact.username);
    msgs.push(msg);
    saveMessages(activeContact.username, msgs);

    // Append to UI
    const wrap = document.getElementById('messages-wrap');
    wrap.appendChild(buildMessageEl(msg));
    scrollToBottom();

    // Sound
    playSoundSent();

    // Refresh contacts
    renderContactList();

    showToast(`${isImage ? 'Photo' : 'Video'} sent!`);

    // Simulate reply
    setTimeout(() => {
      simulateMediaReply(isImage);
    }, 1500);
  };

  reader.readAsDataURL(file);

  // Reset input so same file can be selected again
  e.target.value = '';
}

/**
 * Simulates a text reply from the active contact after sending a message.
 * Adds a realistic delay and typing animation.
 */
function simulateIncomingReply() {
  if (!activeContact) return;

  const replies = [
    'Haha yes exactly 😂', 'That makes sense!', 'For real though 🔥',
    'No way 😱', 'I was just thinking the same thing', 'Okay but actually...',
    'Facts 💯', 'Let\'s gooo 🚀', 'Same tbh', 'Interesting!',
    'Honestly I agree', 'Right?? 🙌', 'That\'s crazy', 'Ok ok 😎',
    'Wait really?', 'Bruh 💀',
  ];

  const delay = 1500 + Math.random() * 1500;

  // Show typing indicator
  setTimeout(() => showTyping(), 700);

  setTimeout(() => {
    hideTyping();

    const contact = activeContact;
    if (!contact) return; // User may have navigated away

    const msg = {
      id:     Date.now(),
      from:   contact.username,
      type:   'text',
      text:   replies[Math.floor(Math.random() * replies.length)],
      time:   getTime(),
      avatar: contact.avatar || `${AVATAR_BASE}${contact.username}`,
      read:   true,
    };

    // Save
    const msgs = getMessages(contact.username);
    msgs.push(msg);
    saveMessages(contact.username, msgs);

    // Render (only if still in this conversation)
    if (activeContact?.username === contact.username) {
      const wrap = document.getElementById('messages-wrap');
      wrap.appendChild(buildMessageEl(msg));
      scrollToBottom();
    }

    playSoundReceived();
    renderContactList();
  }, delay);
}

/**
 * Simulates a reply to a media message.
 * @param {boolean} wasImage
 */
function simulateMediaReply(wasImage) {
  if (!activeContact) return;

  const imageReplies = ['Wow that looks amazing! 😍', 'Great photo! 📸', 'Love it! ❤️'];
  const videoReplies = ['Cool video! 🎬', 'That\'s awesome 🔥', 'Nice clip!'];
  const pool = wasImage ? imageReplies : videoReplies;

  showTyping();

  setTimeout(() => {
    hideTyping();
    if (!activeContact) return;

    const contact = activeContact;
    const msg = {
      id:     Date.now(),
      from:   contact.username,
      type:   'text',
      text:   pool[Math.floor(Math.random() * pool.length)],
      time:   getTime(),
      avatar: contact.avatar || `${AVATAR_BASE}${contact.username}`,
      read:   true,
    };

    const msgs = getMessages(contact.username);
    msgs.push(msg);
    saveMessages(contact.username, msgs);

    if (activeContact?.username === contact.username) {
      const wrap = document.getElementById('messages-wrap');
      wrap.appendChild(buildMessageEl(msg));
      scrollToBottom();
    }

    playSoundReceived();
    renderContactList();
  }, 2000);
}


/* ============================================================
   8. TYPING INDICATOR
============================================================ */

/** Shows the typing animation row. */
function showTyping() {
  if (!activeContact) return;
  const row = document.getElementById('typing-row');
  document.getElementById('typing-label').textContent = `${activeContact.username} is typing...`;
  row.classList.remove('hidden');
  scrollToBottom();
}

/** Hides the typing animation row. */
function hideTyping() {
  document.getElementById('typing-row').classList.add('hidden');
}


/* ============================================================
   9. EMOJI PICKER
============================================================ */

/**
 * Builds the emoji picker grid from EMOJI_LIST.
 * Called once on app init.
 */
function buildEmojiPicker() {
  const panel = document.getElementById('emoji-panel');
  panel.innerHTML = '';
  EMOJI_LIST.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.title = emoji;
    btn.addEventListener('click', () => insertEmoji(emoji));
    panel.appendChild(btn);
  });
}

/** Toggles the emoji panel open/closed. */
function toggleEmoji() {
  const panel = document.getElementById('emoji-panel');
  panel.classList.toggle('hidden');
}

/** Closes the emoji panel. */
function closeEmoji() {
  document.getElementById('emoji-panel').classList.add('hidden');
}

/**
 * Inserts an emoji at the cursor position in the message input.
 * @param {string} emoji
 */
function insertEmoji(emoji) {
  const input = document.getElementById('msg-input');
  const start = input.selectionStart;
  const end = input.selectionEnd;
  input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
  input.selectionStart = input.selectionEnd = start + emoji.length;
  input.focus();
  closeEmoji();
}

// Close emoji panel when clicking anywhere else
document.addEventListener('click', (e) => {
  const panel = document.getElementById('emoji-panel');
  if (!panel) return;
  // Don't close if clicking the emoji button itself or inside the panel
  const emojiToggleBtn = document.querySelector('.input-icon-btn');
  if (!panel.contains(e.target) && e.target !== emojiToggleBtn) {
    closeEmoji();
  }
});


/* ============================================================
   10. IN-CHAT SEARCH
============================================================ */

/** Toggles the in-chat search bar. */
function toggleChatSearch() {
  const bar = document.getElementById('chat-search-bar');
  bar.classList.toggle('hidden');
  if (!bar.classList.contains('hidden')) {
    document.getElementById('chat-search-input').focus();
  } else {
    // Clear search highlighting when closing
    searchInChat('');
  }
}

/**
 * Highlights messages that match the search query.
 * Non-matching messages are faded.
 * @param {string} query
 */
function searchInChat(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.msg-row').forEach(row => {
    const text = row.dataset.text || '';
    if (!q) {
      row.style.opacity = '1';
      row.querySelector('.msg-bubble')?.classList.remove('highlighted');
    } else if (text.includes(q)) {
      row.style.opacity = '1';
      row.querySelector('.msg-bubble')?.classList.add('highlighted');
    } else {
      row.style.opacity = '0.3';
      row.querySelector('.msg-bubble')?.classList.remove('highlighted');
    }
  });
}


/* ============================================================
   11. SETTINGS PANEL
============================================================ */

/** Shows the settings panel by removing the hidden class. */
function showSettings() {
  document.getElementById('settings-panel').classList.remove('hidden');
  loadSettingsUI();
}

/** Hides the settings panel. */
function hideSettings() {
  document.getElementById('settings-panel').classList.add('hidden');
}

/** Loads current user data into the settings form fields. */
function loadSettingsUI() {
  if (!currentUser) return;
  document.getElementById('set-username').value = currentUser.username;
  document.getElementById('set-avatar-url').value = currentUser.avatar || '';
  const avatarSrc = currentUser.avatar || `${AVATAR_BASE}${currentUser.username}`;
  document.getElementById('set-avatar-img').src = avatarSrc;
}

/**
 * Saves the new username from settings.
 */
function saveUsername() {
  const newName = document.getElementById('set-username').value.trim();
  if (!newName) { showToast('Username cannot be empty.'); return; }
  if (newName.length < 3) { showToast('Username too short.'); return; }

  const users = getUsers();
  const idx = users.findIndex(u => u.username === currentUser.username);
  if (idx !== -1) {
    users[idx].username = newName;
    saveUsers(users);
    currentUser = users[idx];
    localStorage.setItem('bfm2_session', JSON.stringify(currentUser));
  }

  updateSidebarProfile();
  showToast('Username updated ✅');
}

/**
 * Saves a new avatar URL from settings.
 */
function saveAvatarUrl() {
  const url = document.getElementById('set-avatar-url').value.trim();
  if (!url) { showToast('Please enter a URL.'); return; }

  const users = getUsers();
  const idx = users.findIndex(u => u.username === currentUser.username);
  if (idx !== -1) {
    users[idx].avatar = url;
    saveUsers(users);
    currentUser = users[idx];
    localStorage.setItem('bfm2_session', JSON.stringify(currentUser));
  }

  updateSidebarProfile();
  document.getElementById('set-avatar-img').src = url;
  showToast('Profile photo updated ✅');
}

/**
 * Handles avatar file upload from the camera icon in settings.
 * Reads file and converts to base64 for storage.
 * @param {Event} e
 */
function handleAvatarChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('Image too large. Max 2MB.'); return; }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    // Update in storage
    const users = getUsers();
    const idx = users.findIndex(u => u.username === currentUser.username);
    if (idx !== -1) {
      users[idx].avatar = dataUrl;
      saveUsers(users);
      currentUser = users[idx];
      localStorage.setItem('bfm2_session', JSON.stringify(currentUser));
    }
    updateSidebarProfile();
    document.getElementById('set-avatar-img').src = dataUrl;
    showToast('Profile photo updated ✅');
  };
  reader.readAsDataURL(file);
}

/**
 * Clears all messages in the active conversation.
 */
function clearActiveChat() {
  if (!activeContact) { showToast('No chat is open.'); return; }
  if (!confirm(`Clear all messages with ${activeContact.username}? This cannot be undone.`)) return;

  saveMessages(activeContact.username, []);
  renderMessages([]);
  renderContactList();
  showToast('Chat cleared 🗑️');
}

/**
 * Toggles notification sounds.
 * @param {HTMLInputElement} el
 */
function toggleSound(el) {
  soundOn = el.checked;
  showToast(soundOn ? 'Sounds on 🔊' : 'Sounds off 🔇');
}

/**
 * Toggles dark/light theme.
 * @param {HTMLInputElement} el
 */
function toggleTheme(el) {
  document.body.classList.toggle('light', !el.checked);
  showToast(el.checked ? 'Dark mode on 🌙' : 'Light mode on ☀️');
}


/* ============================================================
   12. PROFILE MODAL
============================================================ */

/**
 * Opens the profile modal for the given user.
 * @param {Object} user - { username, avatar, joined }
 */
function openProfileModal(user) {
  if (!user) return;
  const avatarSrc = user.avatar || `${AVATAR_BASE}${user.username}`;

  document.getElementById('pm-avatar').src = avatarSrc;
  document.getElementById('pm-name').textContent = user.username;
  document.getElementById('pm-joined').textContent = user.joined || 'Recently';

  // Count total messages from this user in all conversations
  let count = 0;
  const users = getUsers();
  users.forEach(u => {
    if (u.username === user.username) return;
    const key = `bfm2_conv_${convKey(currentUser.username, u.username)}`;
    const msgs = JSON.parse(localStorage.getItem(key) || '[]');
    count += msgs.filter(m => m.from === user.username).length;
  });
  document.getElementById('pm-msg-count').textContent = count;

  document.getElementById('profile-overlay').classList.remove('hidden');
}

/** Opens profile for the currently active contact. */
function openContactProfile() {
  if (activeContact) openProfileModal(activeContact);
}

/** Opens self profile. */
function openSelfProfile() {
  openProfileModal(currentUser);
}

/**
 * Closes the profile modal.
 * Only closes if clicking the overlay background (not the card itself).
 * @param {Event} [e]
 */
function closeProfileModal(e) {
  if (!e || e.target === document.getElementById('profile-overlay')) {
    document.getElementById('profile-overlay').classList.add('hidden');
  }
}

/** Alias for overlay click handler. */
function handleOverlayClick(e) {
  closeProfileModal(e);
}


/* ============================================================
   13. MEDIA LIGHTBOX
   Full-screen preview for images and videos.
============================================================ */

/**
 * Opens the media lightbox with either an image or video.
 * @param {string} type - 'image' or 'video'
 * @param {string} src  - Media URL or base64 data URL
 */
function openLightbox(type, src) {
  const content = document.getElementById('lightbox-content');
  content.innerHTML = '';

  if (type === 'image') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Full size photo';
    content.appendChild(img);
  } else {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    content.appendChild(video);
  }

  // Set download link
  const dlBtn = document.getElementById('lightbox-download');
  dlBtn.href = src;

  document.getElementById('lightbox').classList.remove('hidden');
}

/**
 * Closes the lightbox.
 * Pauses any playing video.
 * @param {Event} [e]
 */
function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox') &&
      !e.target.classList.contains('lightbox-close-btn')) return;

  const content = document.getElementById('lightbox-content');
  const video = content.querySelector('video');
  if (video) video.pause();
  content.innerHTML = '';
  document.getElementById('lightbox').classList.add('hidden');
}

function handleLightboxClick(e) {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
}


/* ============================================================
   14. NOTIFICATION SOUNDS
   Uses Web Audio API — no external files needed.
============================================================ */

/**
 * Plays a short "sent" tone.
 */
function playSoundSent() {
  if (!soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(720, ctx.currentTime);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch(e) {}
}

/**
 * Plays a short "received" notification tone.
 */
function playSoundReceived() {
  if (!soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.setValueAtTime(620, ctx.currentTime + 0.1);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}


/* ============================================================
   15. TOAST NOTIFICATIONS
============================================================ */

let toastTimer = null;

/**
 * Shows a brief toast message at the bottom of the screen.
 * @param {string} msg     - Message to display
 * @param {number} [ms=3000] - Duration in milliseconds
 */
function showToast(msg, ms = 3000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), ms);
}


/* ============================================================
   16. UTILITY HELPERS
============================================================ */

/**
 * Returns the current time as HH:MM string.
 * @returns {string}
 */
function getTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

/**
 * Escapes HTML characters to prevent XSS in user-generated content.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


/* ============================================================
   17. STARTUP
   Checks for an existing session and either launches
   the app or shows the auth screen.
============================================================ */
(function startup() {
  const saved = localStorage.getItem('bfm2_session');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      launchApp();
    } catch (e) {
      localStorage.removeItem('bfm2_session');
    }
  }
  // If no session, auth screen is visible by default (no 'hidden' class on it)
})();