/* Cappe in Miami | IDIOMAS (PT, EN, ES, FR, DE, IT)
   Tabela única: chave = texto original em português (já sem espaços nas pontas);
   valores na ordem: [en, es, fr, de, it].
   - Textos do HTML: traduzidos no DOM, inclusive os criados depois (MutationObserver).
   - Textos do canvas (HUD, pausa, mensagens): traduzidos em tx().
   - Mensagens de confirmação (window.confirm): traduzidas por chave completa.
   Para adicionar um idioma: acrescente uma coluna em IDIOMAS e em cada linha de T. */
(function () {
  'use strict';
  const EXP = window.EXP;
  const $ = id => document.getElementById(id);

  const NAMES = { pt: 'Português', en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano', ru: 'Русский', ja: '日本語', zh: '中文', tr: 'Türkçe', pl: 'Polski', nl: 'Nederlands', ko: '한국어' };
  const IDX = { en: 0, es: 1, fr: 2, de: 3, it: 4 };
  const HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es', fr: 'fr', de: 'de', it: 'it', ru: 'ru', ja: 'ja', zh: 'zh-CN', tr: 'tr', pl: 'pl', nl: 'nl', ko: 'ko' };

  const T = {
    // ----- abertura e menu principal -----
    'MÚSICA ON': ['MUSIC ON', 'MÚSICA ON', 'MUSIQUE ON', 'MUSIK AN', 'MUSICA ON'],
    'MÚSICA OFF': ['MUSIC OFF', 'MÚSICA OFF', 'MUSIQUE OFF', 'MUSIK AUS', 'MUSICA OFF'],
    'SFX ON': ['SFX ON', 'SFX ON', 'SFX ON', 'SFX AN', 'SFX ON'],
    'SFX OFF': ['SFX OFF', 'SFX OFF', 'SFX OFF', 'SFX AUS', 'SFX OFF'],
    'Seja bem-vindo!': ['Welcome!', '¡Bienvenido!', 'Bienvenue !', 'Willkommen!', 'Benvenuto!'],
    'Feito por': ['Made by', 'Hecho por', 'Réalisé par', 'Entwickelt von', 'Realizzato da'],
    'e': ['and', 'y', 'et', 'und', 'e'],
    'ou setas: mover': ['or arrows: move', 'o flechas: mover', 'ou flèches : se déplacer', 'oder Pfeile: bewegen', 'o frecce: muoversi'],
    'Mouse': ['Mouse', 'Ratón', 'Souris', 'Maus', 'Mouse'],
    ': mirar': [': aim', ': apuntar', ': viser', ': zielen', ': mirare'],
    'Clique': ['Click', 'Clic', 'Clic', 'Klick', 'Clic'],
    ': atirar': [': shoot', ': disparar', ': tirer', ': schießen', ': sparare'],
    'Espaço': ['Space', 'Espacio', 'Espace', 'Leertaste', 'Spazio'],
    ': soco / finalizar nocauteado': [': punch / finish knocked-out enemy', ': golpe / rematar noqueado', ': frapper / achever un adversaire KO', ': schlagen / K.-o.-Gegner erledigen', ": pugno / finisci l'avversario KO"],
    ': habilidade especial (máscara do Coelho)': [': special ability (Rabbit mask)', ': habilidad especial (máscara del Conejo)', ': capacité spéciale (masque du Lapin)', ': Spezialfähigkeit (Hasenmaske)', ': abilità speciale (maschera del Coniglio)'],
    ': recomeçar': [': restart', ': reiniciar', ': recommencer', ': neu starten', ': ricomincia'],
    ': pegar/trocar arma · escada/elevador': [': pick up/swap weapon · stairs/elevator', ': recoger/cambiar arma · escalera/ascensor', ": prendre/changer d'arme · escalier/ascenseur", ': Waffe aufheben/tauschen · Treppe/Aufzug', ': prendi/cambia arma · scale/ascensore'],
    ': largar': [': drop', ': soltar', ': lâcher', ': ablegen', ': lascia'],
    ': arremessar': [': throw', ': lanzar', ': lancer', ': werfen', ': lancia'],
    ': recarregar (armas com pente)': [': reload (magazine weapons)', ': recargar (armas con cargador)', ': recharger (armes à chargeur)', ': nachladen (Waffen mit Magazin)', ': ricarica (armi a caricatore)'],
    ': pausar': [': pause', ': pausar', ': pause', ': pausieren', ': pausa'],
    '(pausa): lobby': ['(pause): lobby', '(pausa): lobby', '(pause) : lobby', '(Pause): Lobby', '(pausa): lobby'],
    'Um tiro mata você. Um tiro mata eles. Limpe a sala e ache a saída.': ['One shot kills you. One shot kills them. Clear the room and find the exit.', 'Un disparo te mata. Un disparo los mata. Limpia la sala y encuentra la salida.', "Un tir vous tue. Un tir les tue. Nettoyez la pièce et trouvez la sortie.", 'Ein Schuss tötet dich. Ein Schuss tötet sie. Säubere den Raum und finde den Ausgang.', "Un colpo uccide te. Un colpo uccide loro. Ripulisci la stanza e trova l'uscita."],
    'Jogar': ['Play', 'Jugar', 'Jouer', 'Spielen', 'Gioca'],
    'Modos de Jogo': ['Game Modes', 'Modos de juego', 'Modes de jeu', 'Spielmodi', 'Modalità di gioco'],
    'Modo História': ['Story Mode', 'Modo Historia', 'Mode Histoire', 'Story-Modus', 'Modalità Storia'],
    'Perfil & Coleção': ['Profile & Collection', 'Perfil y colección', 'Profil & Collection', 'Profil & Sammlung', 'Profilo & Collezione'],
    'Opções': ['Options', 'Opciones', 'Options', 'Optionen', 'Opzioni'],
    'ou aperte Enter': ['or press Enter', 'o pulsa Enter', 'ou appuie sur Entrée', 'oder Enter drücken', 'o premi Invio'],
    'Você morreu': ['You died', 'Has muerto', 'Vous êtes mort', 'Du bist gestorben', 'Sei morto'],
    'Tentar de novo': ['Try again', 'Intentar de nuevo', 'Réessayer', 'Nochmal versuchen', 'Riprova'],
    'Trocar máscara': ['Change mask', 'Cambiar máscara', 'Changer de masque', 'Maske wechseln', 'Cambia maschera'],
    'ou aperte R': ['or press R', 'o pulsa R', 'ou appuie sur R', 'oder R drücken', 'o premi R'],
    'Feito por Victor Cappellesso e Davi Gehart': ['Made by Victor Cappellesso and Davi Gehart', 'Hecho por Victor Cappellesso y Davi Gehart', 'Réalisé par Victor Cappellesso et Davi Gehart', 'Entwickelt von Victor Cappellesso und Davi Gehart', 'Realizzato da Victor Cappellesso e Davi Gehart'],
    'Victor Cappellesso': ['Victor Cappellesso', 'Victor Cappellesso', 'Victor Cappellesso', 'Victor Cappellesso', 'Victor Cappellesso'],
    'Davi Gehart': ['Davi Gehart', 'Davi Gehart', 'Davi Gehart', 'Davi Gehart', 'Davi Gehart'],
    'Ative o JavaScript para jogar.': ['Enable JavaScript to play.', 'Activa JavaScript para jugar.', 'Activez JavaScript pour jouer.', 'Aktiviere JavaScript zum Spielen.', 'Attiva JavaScript per giocare.'],

    // ----- seleção de máscara -----
    'Escolha sua máscara': ['Choose your mask', 'Elige tu máscara', 'Choisissez votre masque', 'Wähle deine Maske', 'Scegli la tua maschera'],
    'Mapa:': ['Map:', 'Mapa:', 'Carte :', 'Karte:', 'Mappa:'],
    'Começar': ['Start', 'Empezar', 'Commencer', 'Starten', 'Inizia'],
    'clique numa máscara · setas movem · Enter começa': ['click a mask · arrows move · Enter starts', 'haz clic en una máscara · flechas mueven · Enter empieza', 'cliquez sur un masque · flèches pour bouger · Entrée pour commencer', 'Maske anklicken · Pfeile bewegen · Enter startet', 'clicca una maschera · le frecce muovono · Invio inizia'],
    'Partida Personalizada': ['Custom Match', 'Partida personalizada', 'Partie personnalisée', 'Eigene Partie', 'Partita personalizzata'],
    'Continuar': ['Continue', 'Continuar', 'Continuer', 'Weiter', 'Continua'],
    'Jogar de novo': ['Play again', 'Jugar de nuevo', 'Rejouer', 'Nochmal spielen', 'Gioca di nuovo'],
    'Lobby': ['Lobby', 'Lobby', 'Lobby', 'Lobby', 'Lobby'],
    '‹ Lobby': ['‹ Lobby', '‹ Lobby', '‹ Lobby', '‹ Lobby', '‹ Lobby'],
    'M · LOBBY': ['M · LOBBY', 'M · LOBBY', 'M · LOBBY', 'M · LOBBY', 'M · LOBBY'],
    'Voltar': ['Back', 'Volver', 'Retour', 'Zurück', 'Indietro'],
    'Voltar ao lobby': ['Back to lobby', 'Volver al lobby', 'Retour au lobby', 'Zurück zur Lobby', 'Torna alla lobby'],
    'Voltar ao lobby (Esc)': ['Back to lobby (Esc)', 'Volver al lobby (Esc)', 'Retour au lobby (Échap)', 'Zurück zur Lobby (Esc)', 'Torna alla lobby (Esc)'],
    'B · voltar ao lobby': ['B · back to lobby', 'B · volver al lobby', 'B · retour au lobby', 'B · zurück zur Lobby', 'B · torna alla lobby'],

    // ----- Opções: abas e blocos -----
    'VÍDEO': ['VIDEO', 'VÍDEO', 'VIDÉO', 'VIDEO', 'VIDEO'],
    'JOGABILIDADE': ['GAMEPLAY', 'JUEGO', 'JOUABILITÉ', 'SPIELABLAUF', 'GIOCABILITÀ'],
    'ÁUDIO & DADOS': ['AUDIO & DATA', 'AUDIO Y DATOS', 'AUDIO & DONNÉES', 'AUDIO & DATEN', 'AUDIO & DATI'],
    'ACESSIBILIDADE': ['ACCESSIBILITY', 'ACCESIBILIDAD', 'ACCESSIBILITÉ', 'BARRIEREFREIHEIT', 'ACCESSIBILITÀ'],
    'IDIOMA': ['LANGUAGE', 'IDIOMA', 'LANGUE', 'SPRACHE', 'LINGUA'],
    'Idioma': ['Language', 'Idioma', 'Langue', 'Sprache', 'Lingua'],
    'Salvo automaticamente no navegador': ['Saved automatically in the browser', 'Guardado automáticamente en el navegador', "Enregistré automatiquement dans le navigateur", 'Automatisch im Browser gespeichert', 'Salvato automaticamente nel browser'],
    'Predefinição gráfica': ['Graphics preset', 'Preajuste gráfico', 'Préréglage graphique', 'Grafik-Voreinstellung', 'Preset grafico'],
    'Ultra': ['Ultra', 'Ultra', 'Ultra', 'Ultra', 'Ultra'],
    'Alto': ['High', 'Alto', 'Élevé', 'Hoch', 'Alto'],
    'Médio': ['Medium', 'Medio', 'Moyen', 'Mittel', 'Medio'],
    'Baixo': ['Low', 'Bajo', 'Bas', 'Niedrig', 'Basso'],
    'Desempenho máximo': ['Max performance', 'Máximo rendimiento', 'Performance max.', 'Maximale Leistung', 'Massime prestazioni'],
    'Personalizado': ['Custom', 'Personalizado', 'Personnalisé', 'Benutzerdefiniert', 'Personalizzato'],
    'Qualidade do sangue': ['Blood quality', 'Calidad de la sangre', 'Qualité du sang', 'Blutqualität', 'Qualità del sangue'],
    'Ultra (permanente, denso)': ['Ultra (permanent, dense)', 'Ultra (permanente, densa)', 'Ultra (permanent, dense)', 'Ultra (dauerhaft, dicht)', 'Ultra (permanente, denso)'],
    'Alta (permanente)': ['High (permanent)', 'Alta (permanente)', 'Élevée (permanent)', 'Hoch (dauerhaft)', 'Alta (permanente)'],
    'Média (some em 3 s)': ['Medium (fades in 3 s)', 'Media (desaparece en 3 s)', 'Moyenne (disparaît en 3 s)', 'Mittel (verblasst nach 3 s)', 'Media (svanisce in 3 s)'],
    'Baixa': ['Low', 'Baja', 'Faible', 'Niedrig', 'Bassa'],
    'Desativado': ['Off', 'Desactivado', 'Désactivé', 'Aus', 'Disattivato'],
    'Vermelho do sangue': ['Blood red', 'Rojo de la sangre', 'Rouge du sang', 'Blutrot', 'Rosso sangue'],
    'Brilho': ['Brightness', 'Brillo', 'Luminosité', 'Helligkeit', 'Luminosità'],
    'Scanlines CRT': ['CRT scanlines', 'Líneas de escaneo CRT', 'Lignes de balayage CRT', 'CRT-Scanlines', 'Scanline CRT'],
    'Rastro de movimento': ['Motion trail', 'Estela de movimiento', 'Traînée de mouvement', 'Bewegungsspur', 'Scia di movimento'],
    'Limite de FPS': ['FPS limit', 'Límite de FPS', "Limite d'IPS", 'FPS-Limit', 'Limite FPS'],
    'Desbloqueado': ['Unlocked', 'Desbloqueado', 'Débloqué', 'Entsperrt', 'Sbloccato'],
    'Tamanho da tela': ['Screen size', 'Tamaño de pantalla', "Taille de l'écran", 'Bildschirmgröße', 'Dimensione schermo'],
    'Pequena (640 px)': ['Small (640 px)', 'Pequeña (640 px)', 'Petite (640 px)', 'Klein (640 px)', 'Piccola (640 px)'],
    'Média (800 px)': ['Medium (800 px)', 'Mediana (800 px)', 'Moyenne (800 px)', 'Mittel (800 px)', 'Media (800 px)'],
    'Grande (1024 px)': ['Large (1024 px)', 'Grande (1024 px)', 'Grande (1024 px)', 'Groß (1024 px)', 'Grande (1024 px)'],
    'Máxima (1280 px)': ['Maximum (1280 px)', 'Máxima (1280 px)', 'Maximale (1280 px)', 'Maximal (1280 px)', 'Massima (1280 px)'],
    'Tela cheia (ajusta à janela)': ['Full screen (fits window)', 'Pantalla completa (se ajusta)', "Plein écran (s'adapte)", 'Vollbild (passt sich an)', 'Schermo intero (adattivo)'],
    'Tremor de tela e coice': ['Screen shake & recoil', 'Temblor de pantalla y retroceso', "Tremblement d'écran et recul", 'Bildschirmwackeln & Rückstoß', 'Tremolio schermo e rinculo'],
    'Sensibilidade da câmera': ['Camera sensitivity', 'Sensibilidad de la cámara', 'Sensibilité de la caméra', 'Kamera-Empfindlichkeit', 'Sensibilità camera'],
    'Zoom da câmera': ['Camera zoom', 'Zoom de la cámara', 'Zoom de la caméra', 'Kamera-Zoom', 'Zoom della camera'],
    'Padrão (1x)': ['Default (1x)', 'Normal (1x)', 'Par défaut (1x)', 'Standard (1x)', 'Predefinito (1x)'],
    'Afastado (0.75x)': ['Far (0.75x)', 'Alejado (0.75x)', 'Éloigné (0.75x)', 'Weit (0.75x)', 'Lontano (0.75x)'],
    'Próximo (1.25x)': ['Close (1.25x)', 'Cercano (1.25x)', 'Proche (1.25x)', 'Nah (1.25x)', 'Vicino (1.25x)'],
    'Janela de combo': ['Combo window', 'Ventana de combo', 'Fenêtre de combo', 'Combo-Fenster', 'Finestra combo'],
    'Zona morta da câmera': ['Camera dead zone', 'Zona muerta de la cámara', 'Zone morte de la caméra', 'Kamera-Totzone', 'Zona morta della camera'],
    'Amortecimento do tremor': ['Shake damping', 'Amortiguación del temblor', 'Amortissement du tremblement', 'Wackeldämpfung', 'Smorzamento tremolio'],
    'Rápido': ['Fast', 'Rápido', 'Rapide', 'Schnell', 'Veloce'],
    'Padrão': ['Default', 'Normal', 'Par défaut', 'Standard', 'Predefinito'],
    'Suave': ['Smooth', 'Suave', 'Doux', 'Sanft', 'Morbido'],
    'Teclas de movimento': ['Movement keys', 'Teclas de movimiento', 'Touches de déplacement', 'Bewegungstasten', 'Tasti di movimento'],
    'WASD + setas': ['WASD + arrows', 'WASD + flechas', 'WASD + flèches', 'WASD + Pfeile', 'WASD + frecce'],
    'Somente setas': ['Arrows only', 'Solo flechas', 'Flèches uniquement', 'Nur Pfeile', 'Solo frecce'],
    'Pegar/arremessar arma': ['Pick up/throw weapon', 'Recoger/lanzar arma', "Ramasser/lancer l'arme", 'Waffe aufheben/werfen', 'Raccogli/lancia arma'],
    'Volume da música': ['Music volume', 'Volumen de la música', 'Volume de la musique', 'Musiklautstärke', 'Volume musica'],
    'Volume dos efeitos': ['Effects volume', 'Volumen de efectos', 'Volume des effets', 'Effektlautstärke', 'Volume effetti'],
    'Eventos aleatórios (apagão, reforços, alarme)': ['Random events (blackout, reinforcements, alarm)', 'Eventos aleatorios (apagón, refuerzos, alarma)', 'Événements aléatoires (coupure, renforts, alarme)', 'Zufallsereignisse (Stromausfall, Verstärkung, Alarm)', 'Eventi casuali (blackout, rinforzi, allarme)'],
    'Ferramentas de desenvolvedor: abra com ?dev=1': ['Developer tools: open with ?dev=1', 'Herramientas de desarrollador: abre con ?dev=1', 'Outils de développeur : ouvrir avec ?dev=1', 'Entwicklerwerkzeuge: mit ?dev=1 öffnen', 'Strumenti sviluppatore: apri con ?dev=1'],

    // ----- Opções: acessibilidade -----
    'Tamanho do texto': ['Text size', 'Tamaño del texto', 'Taille du texte', 'Textgröße', 'Dimensione testo'],
    'Normal': ['Normal', 'Normal', 'Normal', 'Normal', 'Normale'],
    'Grande (+20%)': ['Large (+20%)', 'Grande (+20%)', 'Grand (+20 %)', 'Groß (+20 %)', 'Grande (+20%)'],
    'Muito grande (+40%)': ['Very large (+40%)', 'Muy grande (+40%)', 'Très grand (+40 %)', 'Sehr groß (+40 %)', 'Molto grande (+40%)'],
    'Alto contraste': ['High contrast', 'Alto contraste', 'Contraste élevé', 'Hoher Kontrast', 'Alto contrasto'],
    'Filtro para daltonismo': ['Colorblind filter', 'Filtro para daltonismo', 'Filtre daltonisme', 'Farbenblind-Filter', 'Filtro per daltonismo'],
    'Nenhum': ['None', 'Ninguno', 'Aucun', 'Keiner', 'Nessuno'],
    'Protanopia (sem vermelho)': ['Protanopia (no red)', 'Protanopia (sin rojo)', 'Protanopie (sans rouge)', 'Protanopie (kein Rot)', 'Protanopia (niente rosso)'],
    'Deuteranopia (sem verde)': ['Deuteranopia (no green)', 'Deuteranopia (sin verde)', 'Deutéranopie (sans vert)', 'Deuteranopie (kein Grün)', 'Deuteranopia (niente verde)'],
    'Tritanopia (sem azul)': ['Tritanopia (no blue)', 'Tritanopia (sin azul)', 'Tritanopie (sans bleu)', 'Tritanopie (kein Blau)', 'Tritanopia (niente blu)'],
    'Reduzir animações da interface': ['Reduce interface animations', 'Reducir animaciones de la interfaz', "Réduire les animations de l'interface", 'Interface-Animationen reduzieren', "Riduci le animazioni dell'interfaccia"],
    'Reduzir flashes na tela': ['Reduce screen flashes', 'Reducir destellos de pantalla', "Réduire les flashs à l'écran", 'Bildschirm-Blitze reduzieren', 'Riduci i lampi sullo schermo'],
    'Fonte legível para dislexia': ['Dyslexia-friendly font', 'Fuente legible para dislexia', 'Police lisible (dyslexie)', 'Leserliche Schrift (Legasthenie)', 'Font leggibile (dislessia)'],
    'Preferências de acessibilidade são salvas no navegador.': ['Accessibility preferences are saved in the browser.', 'Las preferencias de accesibilidad se guardan en el navegador.', "Les préférences d'accessibilité sont enregistrées dans le navigateur.", 'Barrierefreiheits-Einstellungen werden im Browser gespeichert.', 'Le preferenze di accessibilità sono salvate nel browser.'],

    'Restaurar padrões': ['Restore defaults', 'Restaurar valores', 'Rétablir les valeurs par défaut', 'Standardwerte wiederherstellen', 'Ripristina predefiniti'],

    // ----- Dificuldade e história -----
    'Dificuldade da História': ['Story Difficulty', 'Dificultad de la historia', "Difficulté de l'histoire", 'Story-Schwierigkeit', 'Difficoltà della storia'],
    'Hardcore: quase impossível. Mais inimigos, tiros mais rápidos, sem colete e sem milagre.': ['Hardcore: almost impossible. More enemies, faster shots, no armor and no miracle.', 'Hardcore: casi imposible. Más enemigos, disparos más rápidos, sin chaleco y sin milagro.', "Hardcore : presque impossible. Plus d'ennemis, tirs plus rapides, sans gilet ni miracle.", 'Hardcore: fast unmöglich. Mehr Gegner, schnellere Schüsse, keine Weste und kein Wunder.', 'Hardcore: quasi impossibile. Più nemici, colpi più rapidi, niente giubbotto e niente miracoli.'],
    'Fácil': ['Easy', 'Fácil', 'Facile', 'Leicht', 'Facile'],
    'Difícil': ['Hard', 'Difícil', 'Difficile', 'Schwer', 'Difficile'],
    'Hardcore': ['Hardcore', 'Hardcore', 'Hardcore', 'Hardcore', 'Hardcore'],
    'Enter continua · se morrer, você recomeça este capítulo': ['Enter continues · if you die, you restart this chapter', 'Enter continúa · si mueres, reinicias este capítulo', 'Entrée continue · si vous mourez, vous recommencez ce chapitre', 'Enter weiter · bei Tod startest du dieses Kapitel neu', 'Invio continua · se muori, ricominci questo capitolo'],

    // ----- Perfil e coleção -----
    'Progresso': ['Progress', 'Progreso', 'Progression', 'Fortschritt', 'Progressi'],
    'Máscaras': ['Masks', 'Máscaras', 'Masques', 'Masken', 'Maschere'],
    'Armas': ['Weapons', 'Armas', 'Armes', 'Waffen', 'Armi'],
    'Chefes': ['Bosses', 'Jefes', 'Boss', 'Bosse', 'Boss'],
    'Conquistas': ['Achievements', 'Logros', 'Succès', 'Erfolge', 'Obiettivi'],
    'Recordes': ['Records', 'Récords', 'Records', 'Rekorde', 'Record'],
    'Dados': ['Data', 'Datos', 'Données', 'Daten', 'Dati'],

    // ----- Pausa, HUD e resultados (canvas e DOM) -----
    'PAUSADO': ['PAUSED', 'PAUSA', 'PAUSE', 'PAUSIERT', 'PAUSA'],
    'ESC · CONTINUAR': ['ESC · RESUME', 'ESC · CONTINUAR', 'ESC · REPRENDRE', 'ESC · WEITER', 'ESC · CONTINUA'],
    'R · RECOMEÇAR FASE': ['R · RESTART LEVEL', 'R · REINICIAR FASE', 'R · RECOMMENCER', 'R · NEU STARTEN', 'R · RICOMINCIA'],
    'ESC · PAUSAR   R · RECOMEÇAR': ['ESC · PAUSE   R · RESTART', 'ESC · PAUSA   R · REINICIAR', 'ÉCHAP · PAUSE   R · RECOMMENCER', 'ESC · PAUSE   R · NEU STARTEN', 'ESC · PAUSA   R · RICOMINCIA'],
    'NOCAUTE · ESPAÇO': ['KNOCKED OUT · SPACE', 'NOQUEADO · ESPACIO', 'K.O. · ESPACE', 'K.O. · LEERTASTE', 'KO · SPAZIO'],
    'ATORDOADO': ['STUNNED', 'ATURDIDO', 'ÉTOURDI', 'BETÄUBT', 'STORDITO'],
    'PULO [SHIFT]': ['JUMP [SHIFT]', 'SALTO [SHIFT]', 'SAUT [SHIFT]', 'SPRUNG [SHIFT]', 'SALTO [SHIFT]'],
    'E pegar/trocar  ·  Q largar  ·  BOTÃO DIR. arremessar  ·  ESPAÇO soco/finalizar  ·  ESC pausar': ['E pick up/swap  ·  Q drop  ·  RIGHT CLICK throw  ·  SPACE punch/finish  ·  ESC pause', 'E recoger/cambiar  ·  Q soltar  ·  CLIC DER. lanzar  ·  ESPACIO golpe/rematar  ·  ESC pausa', "E ramasser/changer  ·  Q lâcher  ·  CLIC DROIT lancer  ·  ESPACE frapper/achever  ·  ÉCHAP pause", 'E aufheben/tauschen  ·  Q ablegen  ·  RECHTSKLICK werfen  ·  LEERTASTE schlagen/erledigen  ·  ESC pause', 'E raccogli/cambia  ·  Q lascia  ·  CLIC DX lancia  ·  SPAZIO pugno/finisci  ·  ESC pausa'],
    'Clássico': ['Classic', 'Clásico', 'Classique', 'Klassisch', 'Classico'],
    'História': ['Story', 'Historia', 'Histoire', 'Story', 'Storia'],
    'Campanha: 3 Fases': ['Campaign: 3 Levels', 'Campaña: 3 Fases', 'Campagne : 3 niveaux', 'Kampagne: 3 Level', 'Campagna: 3 livelli'],
    'Horda': ['Horde', 'Horda', 'Horde', 'Horde', 'Orda'],
    'Sobrevivência': ['Survival', 'Supervivencia', 'Survie', 'Überleben', 'Sopravvivenza'],
    'Arcade': ['Arcade', 'Arcade', 'Arcade', 'Arcade', 'Arcade'],
    'Contrarrelógio': ['Time Attack', 'Contrarreloj', 'Contre-la-montre', 'Zeitangriff', 'Contro il tempo'],
    'Assassino': ['Assassin', 'Asesino', 'Assassin', 'Attentäter', 'Assassino'],
    'Limpeza': ['Cleanup', 'Limpieza', 'Nettoyage', 'Säuberung', 'Pulizia'],
    'Invasão': ['Invasion', 'Invasión', 'Invasion', 'Invasion', 'Invasione'],
    'Desafio Diário': ['Daily Challenge', 'Desafío diario', 'Défi du jour', 'Tagesherausforderung', 'Sfida giornaliera'],
    'Roleta de Máscaras': ['Mask Roulette', 'Ruleta de Máscaras', 'Roulette de masques', 'Masken-Roulette', 'Roulette delle maschere'],
    'O relógio nunca para. Cada abate rende segundos.': ['The clock never stops. Each kill adds seconds.', 'El reloj nunca se detiene. Cada baja da segundos.', "L'horloge ne s'arrête jamais. Chaque élimination ajoute des secondes.", 'Die Uhr hört nie auf. Jeder Abschuss bringt Sekunden.', "L'orologio non si ferma mai. Ogni eliminazione aggiunge secondi."],
    'Você não escolhe a máscara: o jogo sorteia uma nova a cada sala e a cada nova tentativa.': ['You do not choose the mask: the game draws a new one every room and every new attempt.', 'No eliges la máscara: el juego sortea una nueva en cada sala y en cada intento.', "Vous ne choisissez pas le masque : le jeu en tire un nouveau à chaque salle et à chaque tentative.", 'Du wählst die Maske nicht: Das Spiel lost in jedem Raum und bei jedem Versuch eine neue aus.', 'Non scegli la maschera: il gioco ne sorteggia una nuova in ogni stanza e a ogni tentativo.'],
  };

  // mensagens de caixas de diálogo (window.confirm)
  const MSG = {
    'Sair da partida e voltar ao lobby?\nO progresso desta fase será perdido.': ['Leave the match and return to the lobby?\nThe progress of this level will be lost.', '¿Salir de la partida y volver al lobby?\nSe perderá el progreso de esta fase.', "Quitter la partie et revenir au lobby ?\nLa progression de ce niveau sera perdue.", 'Spiel verlassen und zurück zur Lobby?\nDer Fortschritt dieses Levels geht verloren.', "Uscire dalla partita e tornare alla lobby?\nI progressi di questo livello andranno persi."],
  };

  // prefixos (textos dinâmicos do canvas): chave = início em português
  const PREFIX = {
    'PONTOS ': ['SCORE ', 'PUNTOS ', 'SCORE ', 'PUNKTE ', 'PUNTI '],
    'SALA LIMPA!  RANK ': ['ROOM CLEARED!  RANK ', '¡SALA LIMPIA!  RANGO ', 'SALLE NETTOYÉE !  RANG ', 'RAUM GESÄUBERT!  RANG ', 'STANZA RIPULITA!  RANGO '],
    'SALA ': ['ROOM ', 'SALA ', 'SALLE ', 'RAUM ', 'STANZA '],
    'ARMA ': ['WEAPON ', 'ARMA ', 'ARME ', 'WAFFE ', 'ARMA '],
    'ABATES ': ['KILLS ', 'BAJAS ', 'ÉLIMINATIONS ', 'KILLS ', 'ELIMINAZIONI '],
    'RECORDE ': ['RECORD ', 'RÉCORD ', 'RECORD ', 'REKORD ', 'RECORD '],
    'AMEAÇA x': ['THREAT x', 'AMENAZA x', 'MENACE x', 'BEDROHUNG x', 'MINACCIA x'],
    'TEMPO ': ['TIME ', 'TIEMPO ', 'TEMPS ', 'ZEIT ', 'TEMPO '],
    'ONDA ': ['WAVE ', 'OLEADA ', 'VAGUE ', 'WELLE ', 'ONDATA '],
    'FICHA -1': ['LIFE -1', 'FICHA -1', 'VIE -1', 'LEBEN -1', 'VITA -1'],
    'COLETE ': ['ARMOR ', 'CHALECO ', 'GILET ', 'WESTE ', 'GIUBBOTTO '],
    'MILAGRE ': ['MIRACLE ', 'MILAGRO ', 'MIRACLE ', 'WUNDER ', 'MIRACOLO '],
  };

  // ----- tabelas por idioma -----
  // idiomas extras (js/exp-i18n-extra.js) não têm coluna em T: o texto vem de window.I18N_EXTRA
  const EXTRA = window.I18N_EXTRA || {};
  for (const l of Object.keys(EXTRA)) IDX[l] = -1;
  const DICT = {}, PRE = {};
  for (const l of Object.keys(IDX)) {
    DICT[l] = {}; PRE[l] = {};
    for (const k of Object.keys(T)) DICT[l][k] = IDX[l] >= 0 ? T[k][IDX[l]] : undefined;
    for (const k of Object.keys(MSG)) DICT[l][k] = IDX[l] >= 0 ? MSG[k][IDX[l]] : undefined;
    for (const k of Object.keys(PREFIX)) PRE[l][k] = IDX[l] >= 0 ? PREFIX[k][IDX[l]] : undefined;
    if (EXTRA[l]) Object.assign(DICT[l], EXTRA[l]);
  }
  // fallback: texto sem tradução usa inglês (e nunca fica em branco)
  for (const l of Object.keys(IDX)) {
    if (l === 'en') continue;
    for (const k of Object.keys(DICT.en)) if (DICT[l][k] === undefined) DICT[l][k] = DICT.en[k];
    for (const k of Object.keys(PRE.en)) if (PRE[l][k] === undefined) PRE[l][k] = PRE.en[k];
  }

  let LANG = 'pt';

  // idiomas asiáticos precisam de fonte com esses caracteres: carrega só quando escolhidos
  function loadCjkFont(l) {
    if (!['ja', 'zh', 'ko'].includes(l) || document.getElementById('cjkFont')) return;
    const link = document.createElement('link');
    link.id = 'cjkFont'; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+KR:wght@400;700&display=swap';
    document.head.appendChild(link);
  }

  // ----- textos do canvas: resultado guardado por texto (chamado dezenas de vezes por quadro) -----
  const TRC = new Map(); let trLang = '';
  function tr(s) {
    if (LANG === 'pt' || typeof s !== 'string') return s;
    if (trLang !== LANG) { TRC.clear(); trLang = LANG; }
    let r = TRC.get(s); if (r !== undefined) return r;
    r = trSlow(s); if (TRC.size > 3000) TRC.clear(); TRC.set(s, r); return r;
  }
  function trSlow(s) {
    if (!s.trim()) return s;
    const t = s.trim(), d = DICT[LANG];
    if (d[t] !== undefined) return s.replace(t, () => d[t]);
    const pre = PRE[LANG];
    const keys = Object.keys(pre).sort((a, b) => b.length - a.length);
    for (const k of keys) if (s.startsWith(k)) return pre[k] + s.slice(k.length);
    return s;
  }
  const _tx = tx;
  tx = function (s, x, y, c, font, al) { return _tx(tr(s), x, y, c, font, al); };

  // ----- textos do DOM (inclusive os criados depois) -----
  const seen = new WeakMap();   // nó de texto -> { orig, shown }
  function translateNode(n) {
    let i = seen.get(n);
    if (!i) { i = { orig: n.nodeValue, shown: null }; seen.set(n, i); }
    else if (i.shown !== null && n.nodeValue !== i.shown) i.orig = n.nodeValue;   // o app reescreveu o texto
    const out = tr(i.orig);
    if (n.nodeValue !== out) n.nodeValue = out;
    i.shown = out;
  }
  function walk(root) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const p = n.parentNode;
      if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)) continue;
      translateNode(n);
    }
  }
  const obs = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'characterData') { if (m.target.nodeType === 3) translateNode(m.target); continue; }
      for (const node of m.addedNodes) {
        if (node.nodeType === 3) translateNode(node);
        else if (node.nodeType === 1) walk(node);
      }
    }
  });

  // ----- mensagens de confirmação nativas -----
  const _confirm = window.confirm.bind(window);
  window.confirm = msg => _confirm(LANG === 'pt' ? msg : (DICT[LANG][msg] || msg));

  // ----- seletor de idioma em Opções -----
  (function addLangOption() {
    const sel = $('o-lang');
    if (!sel) return;
    for (const k of Object.keys(NAMES)) {
      const op = document.createElement('option'); op.value = k; op.textContent = NAMES[k]; sel.appendChild(op);
    }
    sel.onchange = e => setLang(e.target.value);
  })();

  function setLang(l) {
    if (!NAMES[l]) l = 'pt';
    LANG = l;
    EXP.save().settings.lang = l; EXP.touch();
    document.documentElement.lang = HTML_LANG[l];
    loadCjkFont(l);
    const sel = $('o-lang'); if (sel) sel.value = l;
    walk(document.body);
  }
  EXP.setLang = setLang;

  // idioma inicial: o salvo, ou o do navegador se for um dos suportados, senão português
  const nav = (navigator.language || 'pt').slice(0, 2).toLowerCase();
  const initial = EXP.save().settings.lang || 'pt';   // padrão: português do Brasil (só muda se o jogador escolher outro)
  setLang(initial);
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
})();
