const dialogs = document.querySelectorAll("dialog");
const toast = document.querySelector("#toast");
const episodeScreen = document.querySelector("#episode-screen");
const storyScene = document.querySelector("#story-scene");
const characterHotspot = document.querySelector("#character-hotspot");
const characterSpeech = document.querySelector("#character-speech");
const dialogueText = document.querySelector("#dialogue-text");
const dialogueChoices = document.querySelector("#dialogue-choices");
const autoDialogue = document.querySelector("#auto-dialogue");
let toastTimer;
let autoDialogueTimer;

const showToast = (message) => {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
};

document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.querySelector(`#${button.dataset.open}`);
    if (dialog && !dialog.open) dialog.showModal();
  });
});

dialogs.forEach((dialog) => {
  dialog.querySelector(".close-button")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
});

const openEpisodeMap = () => {
  episodeScreen.classList.add("active");
  episodeScreen.setAttribute("aria-hidden", "false");
  document.querySelector("#return-menu").focus();
};

document.querySelector("#start-game").addEventListener("click", () => {
  localStorage.setItem("hondi-started", "true");
  window.location.hash = "episodes";
  openEpisodeMap();
});

document.querySelector("#continue-game").addEventListener("click", () => {
  if (localStorage.getItem("hondi-started")) {
    window.location.hash = "episodes";
    openEpisodeMap();
  } else {
    showToast("저장된 이야기가 없습니다. ‘시작하기’로 첫 여정을 열어 주세요.");
  }
});

document.querySelector("#return-menu").addEventListener("click", () => {
  window.location.hash = "";
  episodeScreen.classList.remove("active");
  episodeScreen.setAttribute("aria-hidden", "true");
  characterSpeech.classList.remove("visible");
  characterSpeech.setAttribute("aria-hidden", "true");
  characterHotspot.setAttribute("aria-expanded", "false");
  document.querySelector("#continue-game").focus();
});

document.querySelectorAll(".map-marker").forEach((marker) => {
  marker.addEventListener("click", () => {
    document.querySelector("#episode-title").textContent = marker.dataset.episode;
    document.querySelector("#episode-description").textContent = marker.dataset.description;
    document.querySelector("#episode-progress").textContent = marker.dataset.progress;
    document.querySelector("#episode-dialog").showModal();
    localStorage.setItem("hondi-selected-episode", marker.dataset.episode);
  });
});

document.querySelector("#enter-episode").addEventListener("click", () => {
  document.querySelector("#episode-dialog").close();
  window.location.hash = "story";
  storyScene.classList.add("active");
  storyScene.setAttribute("aria-hidden", "false");
});

const dialogueResponses = {
  identity: {
    question: "당신은 누구신가요?",
    html: "나는 설문대할망이야.<br />이 섬의 산과 바다를 빚고, 오래된 이야기들을 지켜 온 존재지.<br />사람들은 나를 제주를 만든 거인 할망이라 부른단다.",
  },
  place: {
    question: "이곳은 어떤 곳인가요?",
    html: "이곳은 제주 동쪽의 성산 일출봉이란다.<br />아주 오래전 바닷속에서 불길이 솟아 만들어진 곳이지.<br />지금도 파도와 바람 속에 섬의 기억이 머물고 있어.",
  },
};

const appendDialogueLog = (question, response) => {
  const log = document.querySelector("#dialogue-log");
  const questionItem = document.createElement("li");
  questionItem.innerHTML = `<strong>나</strong><span>${question}</span>`;
  const responseItem = document.createElement("li");
  responseItem.innerHTML = `<strong>설문대할망</strong><span>${response.replaceAll("<br />", " ")}</span>`;
  log.append(questionItem, responseItem);
};

dialogueChoices.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    const response = dialogueResponses[button.dataset.response];
    dialogueChoices.querySelectorAll("button").forEach((choice) => choice.classList.remove("selected"));
    button.classList.add("selected");
    dialogueText.innerHTML = response.html;
    appendDialogueLog(response.question, response.html);

    window.clearTimeout(autoDialogueTimer);
    if (autoDialogue.getAttribute("aria-pressed") === "true") {
      autoDialogueTimer = window.setTimeout(() => {
        document.querySelector("#next-dialogue").click();
      }, 3800);
    }
  });
});

document.querySelector("#next-dialogue").addEventListener("click", () => {
  dialogueText.innerHTML = "그대가 궁금한 것을 물어보렴.<br />바람이 잠잠한 동안에는<br />천천히 이야기를 나눌 수 있을 테니.";
  dialogueChoices.querySelectorAll("button").forEach((button) => button.classList.remove("selected"));
});

autoDialogue.addEventListener("click", () => {
  const isActive = autoDialogue.getAttribute("aria-pressed") === "true";
  autoDialogue.setAttribute("aria-pressed", String(!isActive));
  showToast(isActive ? "자동 진행을 해제했습니다." : "자동 진행을 시작합니다.");
});

document.querySelector("#skip-story").addEventListener("click", () => {
  window.clearTimeout(autoDialogueTimer);
  storyScene.classList.remove("active");
  storyScene.setAttribute("aria-hidden", "true");
  window.location.hash = "episodes";
  showToast("대화를 건너뛰고 지도로 돌아왔습니다.");
});

document.querySelectorAll(".bag-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelector("#item-detail").textContent = item.dataset.item;
  });
});

const toggleCharacterSpeech = (force) => {
  const shouldOpen = force ?? !characterSpeech.classList.contains("visible");
  characterSpeech.classList.toggle("visible", shouldOpen);
  characterSpeech.setAttribute("aria-hidden", String(!shouldOpen));
  characterHotspot.setAttribute("aria-expanded", String(shouldOpen));
};

characterHotspot.addEventListener("click", () => toggleCharacterSpeech());
document.querySelector("#close-speech").addEventListener("click", () => {
  toggleCharacterSpeech(false);
  characterHotspot.focus();
});

document.querySelectorAll(".archive-item").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelector("#lore-detail").textContent = item.dataset.lore;
  });
});

const settings = {
  music: document.querySelector("#music-volume"),
  effect: document.querySelector("#effect-volume"),
  reduceMotion: document.querySelector("#reduce-motion"),
};

const restoreSettings = () => {
  const saved = JSON.parse(localStorage.getItem("hondi-settings") || "null");
  if (!saved) return;
  settings.music.value = saved.music;
  settings.effect.value = saved.effect;
  settings.reduceMotion.checked = saved.reduceMotion;
  document.querySelector("#music-output").textContent = `${saved.music}%`;
  document.querySelector("#effect-output").textContent = `${saved.effect}%`;
  document.body.classList.toggle("reduce-motion", saved.reduceMotion);
};

settings.music.addEventListener("input", () => {
  document.querySelector("#music-output").textContent = `${settings.music.value}%`;
});

settings.effect.addEventListener("input", () => {
  document.querySelector("#effect-output").textContent = `${settings.effect.value}%`;
});

document.querySelector("#save-settings").addEventListener("click", () => {
  const values = {
    music: settings.music.value,
    effect: settings.effect.value,
    reduceMotion: settings.reduceMotion.checked,
  };
  localStorage.setItem("hondi-settings", JSON.stringify(values));
  document.body.classList.toggle("reduce-motion", values.reduceMotion);
  document.querySelector("#settings-dialog").close();
  showToast("설정을 저장했습니다.");
});

restoreSettings();

if (window.location.hash === "#episodes") {
  openEpisodeMap();
}

if (window.location.hash === "#story") {
  storyScene.classList.add("active");
  storyScene.setAttribute("aria-hidden", "false");
}

window.addEventListener("hashchange", () => {
  if (window.location.hash === "#episodes") {
    storyScene.classList.remove("active");
    storyScene.setAttribute("aria-hidden", "true");
    openEpisodeMap();
    return;
  }

  if (window.location.hash === "#story") {
    storyScene.classList.add("active");
    storyScene.setAttribute("aria-hidden", "false");
    return;
  }

  episodeScreen.classList.remove("active");
  episodeScreen.setAttribute("aria-hidden", "true");
  storyScene.classList.remove("active");
  storyScene.setAttribute("aria-hidden", "true");
});
