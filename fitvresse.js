/* =========================================================
   FITVRESSE — script.js
   Chaque fonctionnalité est isolée dans sa propre fonction
   "init...()" et vérifie d'abord que les éléments dont elle
   a besoin existent sur la page. Si une page ne les a pas,
   la fonction s'arrête simplement — le reste du script
   continue de tourner normalement.
========================================================= */

/* =========================================================
   SUPABASE — connexion à la base de données
   Nécessite d'avoir ajouté, AVANT ce fichier, dans le HTML :
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
========================================================= */

// À MODIFIER : remplace par ton Project URL et ta clé anon/publishable
const SUPABASE_URL = "https://mphgxlqsecwrrybgsvbw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waGd4bHFzZWN3cnJ5YmdzdmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMjQ4MTQsImV4cCI6MjEwNTYwMDgxNH0.AuOPaSxDGcxpGKDCt-NDx9bjC4tJMKpITvtkT9kmQhM";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.addEventListener("DOMContentLoaded", function() {

  initCookies();
  initMenuMobile();
  initNavigationAncres();
  initModaleVideo();
  initAssistanteIA();
  initCartesHover();
  initFormulaireRdv();
  initCompte();
  initNewsletter();
  initFaqAccordeon();
  initFaqChat();
  initSessionEspace();
  initSuiviProgression();
  initProfil();
  initEspaceCoach();

});


/* =========================================================
   BANDEAU COOKIES
========================================================= */

function initCookies() {

  const cookiesBandeau = document.querySelector("#cookies-bandeau");

  if (!cookiesBandeau) {
    return;
  }

  const cookiesAccepter = document.querySelector("#cookies-accepter");
  const cookiesRefuser = document.querySelector("#cookies-refuser");
  const iaWidget = document.querySelector(".ia-widget");

  const choixCookies = localStorage.getItem("fitvresse-cookies");

  if (!choixCookies) {
    cookiesBandeau.hidden = false;
    if (iaWidget) {
      iaWidget.hidden = true;
    }
  }

  function repondre(choix) {

    localStorage.setItem("fitvresse-cookies", choix);

    cookiesBandeau.hidden = true;

    if (iaWidget) {
      iaWidget.hidden = false;
    }

  }

  if (cookiesAccepter) {
    cookiesAccepter.addEventListener("click", function() {
      repondre("accepte");
    });
  }

  if (cookiesRefuser) {
    cookiesRefuser.addEventListener("click", function() {
      repondre("refuse");
    });
  }

}


/* =========================================================
   MENU MOBILE
========================================================= */

function initMenuMobile() {

  const menuToggle = document.querySelector(".menu-toggle");
  const menuMobile = document.querySelector("#menu-mobile");

  if (!menuToggle || !menuMobile) {
    return;
  }

  function fermerMenu() {
    menuMobile.classList.remove("ouvert");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", function() {

    const estOuvert = menuMobile.classList.toggle("ouvert");

    menuToggle.setAttribute("aria-expanded", String(estOuvert));

  });

  document.addEventListener("keydown", function(event) {

    if (event.key === "Escape" && menuMobile.classList.contains("ouvert")) {
      fermerMenu();
      menuToggle.focus();
    }

  });

  document.addEventListener("click", function(event) {

    const dansLeMenu = menuMobile.contains(event.target);
    const surLeBouton = menuToggle.contains(event.target);

    if (!dansLeMenu && !surLeBouton && menuMobile.classList.contains("ouvert")) {
      fermerMenu();
    }

  });

}


/* =========================================================
   NAVIGATION — ancres avec défilement fluide
========================================================= */

function initNavigationAncres() {

  const liens = document.querySelectorAll('a[href^="#"]');
  const menuMobile = document.querySelector("#menu-mobile");
  const menuToggle = document.querySelector(".menu-toggle");

  liens.forEach(function(lien) {

    lien.addEventListener("click", function(event) {

      const destination = lien.getAttribute("href");

      if (!destination || destination === "#") {
        return;
      }

      const section = document.querySelector(destination);

      if (!section) {
        return;
      }

      event.preventDefault();

      section.scrollIntoView({ behavior: "smooth" });

      if (menuMobile && menuMobile.classList.contains("ouvert")) {
        menuMobile.classList.remove("ouvert");
        if (menuToggle) {
          menuToggle.setAttribute("aria-expanded", "false");
        }
      }

    });

  });

}


/* =========================================================
   MODALE VIDÉO (exercices)
========================================================= */

function initModaleVideo() {

  const videoModal = document.querySelector("#video-modal");

  if (!videoModal) {
    return;
  }

  const videoModalTitre = document.querySelector("#video-modal-titre");
  const videoModalFermer = document.querySelector("#video-modal-fermer");

  const declencheurs = document.querySelectorAll(
    ".exercise-card, .video-placeholder"
  );

  function ouvrir(nom) {
    if (videoModalTitre) {
      videoModalTitre.textContent = nom || "";
    }
    videoModal.hidden = false;
  }

  function fermer() {
    videoModal.hidden = true;
  }

  declencheurs.forEach(function(declencheur) {

    declencheur.addEventListener("click", function() {
      ouvrir(declencheur.dataset.exercise);
    });

    declencheur.addEventListener("keydown", function(event) {

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        ouvrir(declencheur.dataset.exercise);
      }

    });

  });

  if (videoModalFermer) {
    videoModalFermer.addEventListener("click", fermer);
  }

  videoModal.addEventListener("click", function(event) {
    if (event.target === videoModal) {
      fermer();
    }
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && !videoModal.hidden) {
      fermer();
    }
  });

}


/* =========================================================
   ASSISTANTE IA
   Appelle le Worker Cloudflare (qui garde la clé Gemini secrète).
   Si l'IA est indisponible, les réponses à mots-clés prennent le relais.
========================================================= */

function initAssistanteIA() {

  const iaToggle = document.querySelector("#ia-toggle");

  if (!iaToggle) {
    return;
  }

  const iaPanneau = document.querySelector("#ia-panneau");
  const iaFermer = document.querySelector("#ia-fermer");
  const iaForm = document.querySelector("#ia-form");
  const iaInput = document.querySelector("#ia-input");
  const iaMessages = document.querySelector("#ia-messages");

  // Adresse du Worker Cloudflare
  const URL_ASSISTANTE = "https://fitvresse-ia.mariamsacko-dev.workers.dev";

  // Mémoire de la conversation en cours (effacée quand on recharge la page)
  const historique = [];

  const regles = [
    {
      motsCles: ["nutrition", "sante", "santé", "nourriture", "manger", "alimentation", "repas"],
      reponse: "Question nutrition ! Les conseils personnalisés de Sarah arrivent bientôt. En attendant, tu peux déjà bouger : Squat, Fentes et Gainage sont dans la section Exercices — clique sur une carte pour voir la vidéo."
    },
    {
      motsCles: ["sport", "exercice", "exercices", "muscu", "musculation", "entrainement", "entraînement", "seance", "séance", "bouger"],
      reponse: "Voici les exercices disponibles pour commencer : Squat, Fentes, Gainage. Rendez-vous dans la section Exercices et clique sur une carte pour voir la vidéo de démonstration."
    },
    {
      motsCles: ["rendez-vous", "rdv", "reserver", "réserver", "contact"],
      reponse: "Tu peux prendre rendez-vous directement via le formulaire de la section \"Prête à commencer ?\" plus haut sur la page."
    }
  ];

  function genererReponse(question) {

    const q = question.toLowerCase();

    const regle = regles.find(function(r) {
      return r.motsCles.some(function(mot) {
        return q.includes(mot);
      });
    });

    return regle
      ? regle.reponse
      : "Merci pour ta question ! Je ne peux pas te répondre pour le moment. Pose-moi une question sur le sport, la nutrition ou la prise de rendez-vous, ou écris à contact@fitvresse.fr.";

  }

  function ouvrir() {
    iaPanneau.hidden = false;
    iaToggle.setAttribute("aria-expanded", "true");
    if (iaInput) {
      iaInput.focus();
    }
  }

  function fermer() {
    iaPanneau.hidden = true;
    iaToggle.setAttribute("aria-expanded", "false");
    iaToggle.focus();
  }

  iaToggle.addEventListener("click", function() {
    if (iaPanneau.hidden) {
      ouvrir();
    } else {
      fermer();
    }
  });

  if (iaFermer) {
    iaFermer.addEventListener("click", fermer);
  }

  if (iaForm && iaInput && iaMessages) {

    iaForm.addEventListener("submit", async function(event) {

      event.preventDefault();

      const question = iaInput.value.trim();

      if (!question) {
        return;
      }

      const messageUser = document.createElement("p");
      messageUser.className = "ia-message ia-message-user";
      messageUser.textContent = question;
      iaMessages.appendChild(messageUser);

      iaForm.reset();

      const messageBot = document.createElement("p");
      messageBot.className = "ia-message ia-message-bot";
      messageBot.textContent = "...";
      iaMessages.appendChild(messageBot);
      iaMessages.scrollTop = iaMessages.scrollHeight;

      try {

        const response = await fetch(URL_ASSISTANTE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: question,
            historique: historique.slice(-6)
          })
        });

        const data = await response.json();

        if (response.ok && data.reponse) {

          messageBot.textContent = data.reponse;

          historique.push({ role: "user", text: question });
          historique.push({ role: "model", text: data.reponse });

        } else {

          messageBot.textContent = genererReponse(question);

        }

      } catch (erreur) {

        // Si l'IA est indisponible, on garde les réponses à mots-clés
        messageBot.textContent = genererReponse(question);

      }

      iaMessages.scrollTop = iaMessages.scrollHeight;

    });

  }

}


/* =========================================================
   CARTES — effet au survol (services / exercices)
========================================================= */

function initCartesHover() {

  const cartes = document.querySelectorAll(".service-card, .exercise-card");

  cartes.forEach(function(carte) {

    carte.addEventListener("mouseenter", function() {
      carte.classList.add("active");
    });

    carte.addEventListener("mouseleave", function() {
      carte.classList.remove("active");
    });

  });

}


/* =========================================================
   FORMULAIRE RENDEZ-VOUS — envoi réel vers Formspree
========================================================= */

function initFormulaireRdv() {

  const rdvForm = document.querySelector("#rdv-form");

  if (!rdvForm) {
    return;
  }

  const rdvConfirmation = document.querySelector("#rdv-confirmation");
  const FORMSPREE_URL = "https://formspree.io/f/mvkgowll";

  rdvForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!rdvForm.checkValidity()) {

      if (rdvConfirmation) {
        rdvConfirmation.textContent = "Merci de vérifier les champs du formulaire.";
      }

      return;

    }

    if (rdvConfirmation) {
      rdvConfirmation.textContent = "Envoi en cours...";
    }

    const donnees = new FormData(rdvForm);

    fetch(FORMSPREE_URL, {
      method: "POST",
      body: donnees,
      headers: {
        "Accept": "application/json"
      }
    })
      .then(function(response) {

        if (response.ok) {

          if (rdvConfirmation) {
            rdvConfirmation.textContent = "Merci, ta demande a bien été envoyée. Nous te recontactons rapidement.";
          }

          rdvForm.reset();

        } else {

          if (rdvConfirmation) {
            rdvConfirmation.textContent = "Une erreur est survenue, merci de réessayer ou de nous contacter directement.";
          }

        }

      })
      .catch(function() {

        if (rdvConfirmation) {
          rdvConfirmation.textContent = "Impossible d'envoyer le formulaire pour le moment, vérifie ta connexion.";
        }

      });

  });

}


/* =========================================================
   COMPTE — connexion / inscription réelles avec Supabase
========================================================= */

function initCompte() {

  const ongletConnexion = document.querySelector("#onglet-connexion");
  const ongletInscription = document.querySelector("#onglet-inscription");

  if (!ongletConnexion || !ongletInscription) {
    return;
  }

  const panneauConnexion = document.querySelector("#panneau-connexion");
  const panneauInscription = document.querySelector("#panneau-inscription");
  const compteConfirmation = document.querySelector("#compte-confirmation");

  function afficherConnexion() {
    panneauConnexion.hidden = false;
    panneauInscription.hidden = true;
    ongletConnexion.setAttribute("aria-selected", "true");
    ongletInscription.setAttribute("aria-selected", "false");
  }

  function afficherInscription() {
    panneauConnexion.hidden = true;
    panneauInscription.hidden = false;
    ongletConnexion.setAttribute("aria-selected", "false");
    ongletInscription.setAttribute("aria-selected", "true");
  }

  ongletConnexion.addEventListener("click", afficherConnexion);
  ongletInscription.addEventListener("click", afficherInscription);

  // Redirige la personne selon son rôle (lu dans la table "profils")
  async function redirigerSelonRole(userId) {

    const { data: profil } = await sb
      .from("profils")
      .select("role")
      .eq("id", userId)
      .single();

    window.location.href = (profil && profil.role === "coach")
      ? "espace-coach.html"
      : "espace-membre.html";

  }

  if (panneauConnexion) {

    panneauConnexion.addEventListener("submit", async function(event) {

      event.preventDefault();

      const emailChamp = document.querySelector("#connexion-email");
      const mdpChamp = document.querySelector("#connexion-mdp");

      const email = emailChamp ? emailChamp.value.trim() : "";
      const mdp = mdpChamp ? mdpChamp.value : "";

      if (compteConfirmation) {
        compteConfirmation.textContent = "Connexion en cours...";
      }

      const { data, error } = await sb.auth.signInWithPassword({
        email: email,
        password: mdp
      });

      if (error) {

        if (compteConfirmation) {
          compteConfirmation.textContent = "Email ou mot de passe incorrect.";
        }

        return;

      }

      await redirigerSelonRole(data.user.id);

    });

  }

  if (panneauInscription) {

    panneauInscription.addEventListener("submit", async function(event) {

      event.preventDefault();

      const prenomChamp = document.querySelector("#inscription-prenom");
      const emailChamp = document.querySelector("#inscription-email");
      const mdpChamp = document.querySelector("#inscription-mdp");

      const prenom = prenomChamp ? prenomChamp.value.trim() : "";
      const email = emailChamp ? emailChamp.value.trim() : "";
      const mdp = mdpChamp ? mdpChamp.value : "";

      if (compteConfirmation) {
        compteConfirmation.textContent = "Création du compte...";
      }

      const { data, error } = await sb.auth.signUp({
        email: email,
        password: mdp
      });

      if (error) {

        if (compteConfirmation) {
          compteConfirmation.textContent = "Impossible de créer le compte : " + error.message;
        }

        return;

      }

      // Crée la ligne de profil associée (rôle "membre" par défaut)
      if (data.user) {

        await sb.from("profils").insert({
          id: data.user.id,
          prenom: prenom,
          role: "membre"
        });

      }

      // Si la confirmation par email est activée, il n'y a pas de session immédiate
      if (!data.session) {

        if (compteConfirmation) {
          compteConfirmation.textContent = "Compte créé ! Vérifie tes emails pour confirmer ton adresse avant de te connecter.";
        }

        return;

      }

      window.location.href = "espace-membre.html";

    });

  }

}


/* =========================================================
   NEWSLETTER
========================================================= */

function initNewsletter() {

  const newsletterForm = document.querySelector("#newsletter-form");

  if (!newsletterForm) {
    return;
  }

  const newsletterConfirmation = document.querySelector("#newsletter-confirmation");

  newsletterForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (newsletterForm.checkValidity()) {

      if (newsletterConfirmation) {
        newsletterConfirmation.textContent = "Merci, ton inscription à la newsletter est confirmée !";
      }

      newsletterForm.reset();

    } else if (newsletterConfirmation) {

      newsletterConfirmation.textContent = "Merci d'indiquer une adresse email valide.";

    }

  });

}


/* =========================================================
   FAQ — accordéon
========================================================= */

function initFaqAccordeon() {

  const questions = document.querySelectorAll(".faq-question");

  questions.forEach(function(question) {

    question.addEventListener("click", function() {

      const idReponse = question.getAttribute("aria-controls");
      const reponse = idReponse ? document.querySelector("#" + idReponse) : null;

      if (!reponse) {
        return;
      }

      const estOuvert = question.getAttribute("aria-expanded") === "true";

      question.setAttribute("aria-expanded", String(!estOuvert));
      reponse.hidden = estOuvert;

    });

  });

}


/* =========================================================
   FAQ — mini chat
========================================================= */

function initFaqChat() {

  const faqChatForm = document.querySelector("#faq-chat-form");

  if (!faqChatForm) {
    return;
  }

  const faqChatInput = document.querySelector("#faq-chat-input");
  const faqChatMessages = document.querySelector("#faq-chat-messages");

  if (!faqChatInput || !faqChatMessages) {
    return;
  }

  const regles = [
    {
      motsCles: ["niveau", "debutant", "débutant", "debutante", "débutante"],
      reponse: "Aucun niveau requis pour démarrer, les séances s'adaptent à toi."
    },
    {
      motsCles: ["tarif", "prix", "combien", "cout", "coût"],
      reponse: "Les tarifs varient selon la formule choisie — écris à contact@fitvresse.fr pour un devis personnalisé."
    },
    {
      motsCles: ["ou", "où", "lieu", "adresse", "sarcelles"],
      reponse: "Le lieu des séances est précisé lors de la prise de rendez-vous, selon la formule choisie."
    },
    {
      motsCles: ["annuler", "modifier", "rendez-vous", "rdv"],
      reponse: "Pour annuler ou modifier un rendez-vous, écris directement à contact@fitvresse.fr."
    },
    {
      motsCles: ["compte", "connexion", "espace", "elearning", "e-learning"],
      reponse: "Ton espace personnel est accessible via \"Mon compte\" en haut de la page, une fois connectée."
    }
  ];

  function genererReponse(question) {

    const q = question.toLowerCase();

    const regle = regles.find(function(r) {
      return r.motsCles.some(function(mot) {
        return q.includes(mot);
      });
    });

    return regle
      ? regle.reponse
      : "Merci pour ta question ! Pour une réponse précise, écris directement à contact@fitvresse.fr.";

  }

  faqChatForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const question = faqChatInput.value.trim();

    if (!question) {
      return;
    }

    const messageUser = document.createElement("p");
    messageUser.className = "faq-chat-message faq-chat-message-user";
    messageUser.textContent = question;
    faqChatMessages.appendChild(messageUser);

    const messageBot = document.createElement("p");
    messageBot.className = "faq-chat-message faq-chat-message-bot";
    messageBot.textContent = genererReponse(question);
    faqChatMessages.appendChild(messageBot);

    faqChatMessages.scrollTop = faqChatMessages.scrollHeight;

    faqChatForm.reset();

  });

}


/* =========================================================
   ESPACES CONNECTÉS — vérification de session réelle (Supabase)
   (ne s'exécute que sur espace-membre.html / espace-coach.html)
========================================================= */

function initSessionEspace() {

  const btnDeconnexion = document.querySelector("#btn-deconnexion");
  const btnDeconnexionCoach = document.querySelector("#btn-deconnexion-coach");

  const surPageEspace = btnDeconnexion || btnDeconnexionCoach;

  if (!surPageEspace) {
    return;
  }

  const surPageCoach = !!btnDeconnexionCoach;

  async function verifierSession() {

    const { data: { session } } = await sb.auth.getSession();

    if (!session) {
      window.location.href = "index.html#compte";
      return;
    }

    const { data: profil } = await sb
      .from("profils")
      .select("prenom, role")
      .eq("id", session.user.id)
      .single();

    // Empêche une membre d'ouvrir l'espace coach, et inversement
    if (surPageCoach && (!profil || profil.role !== "coach")) {
      window.location.href = "espace-membre.html";
      return;
    }

    if (!surPageCoach && profil && profil.role === "coach") {
      window.location.href = "espace-coach.html";
      return;
    }

    const membrePrenom = document.querySelector("#membre-prenom");

    if (membrePrenom && profil) {
      membrePrenom.textContent = profil.prenom || "";
    }

  }

  verifierSession();

  async function deconnecter() {
    await sb.auth.signOut();
    window.location.href = "index.html";
  }

  if (btnDeconnexion) {
    btnDeconnexion.addEventListener("click", deconnecter);
  }

  if (btnDeconnexionCoach) {
    btnDeconnexionCoach.addEventListener("click", deconnecter);
  }

}


/* =========================================================
   SUIVI DE PROGRESSION (espace-membre.html) — Supabase
========================================================= */

function initSuiviProgression() {

  const suiviForm = document.querySelector("#suivi-form");

  if (!suiviForm) {
    return;
  }

  const suiviListe = document.querySelector("#suivi-liste");
  const suiviStats = document.querySelector("#suivi-stats");

  async function chargerSeances() {

    const { data, error } = await sb
      .from("suivi_seances")
      .select("*")
      .order("date", { ascending: false });

    return error ? [] : data;

  }

  async function afficher() {

    const seances = await chargerSeances();

    if (suiviStats) {

      const maintenant = new Date();
      const debutSemaine = new Date(maintenant);
      debutSemaine.setDate(maintenant.getDate() - 7);

      const seancesSemaine = seances.filter(function(seance) {
        return new Date(seance.date) >= debutSemaine;
      });

      suiviStats.innerHTML = "";

      [
        { valeur: seances.length, libelle: "séances au total" },
        { valeur: seancesSemaine.length, libelle: "ces 7 derniers jours" }
      ].forEach(function(stat) {

        const bloc = document.createElement("div");
        bloc.className = "suivi-stat";

        const valeur = document.createElement("strong");
        valeur.textContent = String(stat.valeur);

        const libelle = document.createElement("span");
        libelle.textContent = stat.libelle;

        bloc.appendChild(valeur);
        bloc.appendChild(libelle);

        suiviStats.appendChild(bloc);

      });

    }

    if (!suiviListe) {
      return;
    }

    suiviListe.innerHTML = "";

    if (seances.length === 0) {

      const vide = document.createElement("p");
      vide.className = "suivi-vide";
      vide.textContent = "Aucune séance enregistrée pour le moment.";
      suiviListe.appendChild(vide);

      return;

    }

    seances.forEach(function(seance) {

      const item = document.createElement("li");

      const gauche = document.createElement("strong");
      gauche.textContent = seance.date + " — " + seance.type;

      const droite = document.createElement("span");
      droite.textContent = seance.note
        ? seance.ressenti + " · " + seance.note
        : seance.ressenti;

      item.appendChild(gauche);
      item.appendChild(droite);

      suiviListe.appendChild(item);

    });

  }

  suiviForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const dateChamp = document.querySelector("#suivi-date");
    const date = dateChamp ? dateChamp.value : "";

    if (!date) {
      return;
    }

    const typeChamp = document.querySelector("#suivi-type");
    const ressentiChamp = document.querySelector("#suivi-ressenti");
    const noteChamp = document.querySelector("#suivi-note");

    const { data: { session } } = await sb.auth.getSession();

    if (!session) {
      return;
    }

    await sb.from("suivi_seances").insert({
      user_id: session.user.id,
      date: date,
      type: typeChamp ? typeChamp.value : "",
      ressenti: ressentiChamp ? ressentiChamp.value : "",
      note: noteChamp ? noteChamp.value.trim() : ""
    });

    suiviForm.reset();

    afficher();

  });

  afficher();

}


/* =========================================================
   MON PROFIL (espace-membre.html) — Supabase
========================================================= */

function initProfil() {

  const profilForm = document.querySelector("#profil-form");

  if (!profilForm) {
    return;
  }

  const profilConfirmation = document.querySelector("#profil-confirmation");

  const champs = {
    objectif: document.querySelector("#profil-objectif"),
    niveau: document.querySelector("#profil-niveau"),
    seances_semaine: document.querySelector("#profil-seances"),
    alimentation: document.querySelector("#profil-alimentation"),
    notes: document.querySelector("#profil-notes")
  };

  async function precharger() {

    const { data: { session } } = await sb.auth.getSession();

    if (!session) {
      return;
    }

    const { data: profil } = await sb
      .from("profils")
      .select("objectif, niveau, seances_semaine, alimentation, notes")
      .eq("id", session.user.id)
      .single();

    if (!profil) {
      return;
    }

    Object.keys(champs).forEach(function(cle) {
      if (champs[cle] && profil[cle] !== null && profil[cle] !== undefined) {
        champs[cle].value = profil[cle];
      }
    });

  }

  precharger();

  profilForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const { data: { session } } = await sb.auth.getSession();

    if (!session) {
      return;
    }

    const misesAJour = {};

    Object.keys(champs).forEach(function(cle) {
      misesAJour[cle] = champs[cle] ? champs[cle].value : "";
    });

    const { error } = await sb
      .from("profils")
      .update(misesAJour)
      .eq("id", session.user.id);

    if (profilConfirmation) {
      profilConfirmation.textContent = error
        ? "Une erreur est survenue, réessaie."
        : "Ton profil est enregistré.";
    }

  });

}


/* =========================================================
   ESPACE COACH (espace-coach.html) — Supabase
   Le coach choisit une cliente parmi les membres inscrites.
========================================================= */

function initEspaceCoach() {

  const coachForm = document.querySelector("#coach-form");

  if (!coachForm) {
    return;
  }

  const coachConfirmation = document.querySelector("#coach-confirmation");
  const coachListe = document.querySelector("#coach-liste");
  const clienteChamp = document.querySelector("#coach-cliente");

  // Remplit la liste des clientes si #coach-cliente est un <select>
  async function chargerClientes() {

    if (!clienteChamp || clienteChamp.tagName !== "SELECT") {
      return;
    }

    const { data: clientes } = await sb
      .from("profils")
      .select("id, prenom")
      .eq("role", "membre");

    clienteChamp.innerHTML = '<option value="">Choisir une cliente</option>';

    (clientes || []).forEach(function(cliente) {

      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = cliente.prenom || "(sans prénom)";
      clienteChamp.appendChild(option);

    });

  }

  async function afficher() {

    if (!coachListe) {
      return;
    }

    const { data: programmes } = await sb
      .from("programmes")
      .select("cliente_prenom, programme")
      .order("created_at", { ascending: false });

    coachListe.innerHTML = "";

    if (!programmes || programmes.length === 0) {

      const vide = document.createElement("p");
      vide.className = "coach-vide";
      vide.textContent = "Aucun programme enregistré pour le moment.";
      coachListe.appendChild(vide);

      return;

    }

    programmes.forEach(function(programme) {

      const item = document.createElement("li");

      const titre = document.createElement("strong");
      titre.textContent = programme.cliente_prenom;

      const detail = document.createElement("span");
      detail.textContent = programme.programme || "Programme à compléter";

      item.appendChild(titre);
      item.appendChild(detail);

      coachListe.appendChild(item);

    });

  }

  coachForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!clienteChamp) {
      return;
    }

    // Si #coach-cliente est un select : sa valeur est l'id de la cliente.
    // Si c'est encore un champ texte, on ne peut pas la relier à un vrai
    // compte — voir la note envoyée avec ce fichier.
    const estSelect = clienteChamp.tagName === "SELECT";
    const clienteId = estSelect ? clienteChamp.value : "";
    const clientePrenom = estSelect
      ? (clienteChamp.selectedOptions[0] ? clienteChamp.selectedOptions[0].textContent : "")
      : clienteChamp.value.trim();

    if (!clienteId || !clientePrenom) {

      if (coachConfirmation) {
        coachConfirmation.textContent = "Merci de choisir une cliente dans la liste.";
      }

      return;

    }

    const programmeChamp = document.querySelector("#coach-programme");
    const nutritionChamp = document.querySelector("#coach-nutrition");

    const { error } = await sb.from("programmes").insert({
      cliente_id: clienteId,
      cliente_prenom: clientePrenom,
      programme: programmeChamp ? programmeChamp.value.trim() : "",
      nutrition: nutritionChamp ? nutritionChamp.value.trim() : ""
    });

    if (coachConfirmation) {
      coachConfirmation.textContent = error
        ? "Une erreur est survenue, réessaie."
        : "Programme enregistré pour " + clientePrenom + ".";
    }

    coachForm.reset();

    afficher();

  });

  chargerClientes();
  afficher();

}
