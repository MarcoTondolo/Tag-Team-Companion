import { Hero } from '../types';

export const HEROES: Hero[] = [
  {
    id: 'wong',
    name: 'Wong',
    title: {
      it: 'Maestro delle Arti Mistiche',
      en: 'Master of Mystic Arts',
    },
    startingHp: 17,
    startingPower: 2,
    maxHp: 17,
    avatarColor: 'amber',
    iconName: 'scroll',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Equilibrato con un alto valore di HP iniziali (17) e 2 Potere.',
        en: 'Balanced fighter with high starting HP (17) and 2 Power.',
      },
    },
  },
  {
    id: 'bodvar',
    name: 'Bödvar',
    title: {
      it: 'Guerriero Orso Vichingo',
      en: 'Viking Bear Warrior',
    },
    startingHp: 11,
    startingPower: 3,
    maxHp: 11,
    hasMaxHpCap: true,
    avatarColor: 'orange',
    iconName: 'shield-alert',
    specialMechanic: {
      type: 'bodvar_bear',
      description: {
        it: 'Quando diventa Orso, guadagna HP pari al suo Potere attuale (fino a un massimo di 15 HP).',
        en: 'When transforming into Bear, gains HP equal to current Power (capped at 15 HP).',
      },
    },
  },
  {
    id: 'ching_shih',
    name: 'Ching-Shih',
    title: {
      it: 'Regina dei Pirati',
      en: 'Pirate Queen',
    },
    startingHp: 14,
    startingPower: 2,
    maxHp: 14,
    avatarColor: 'cyan',
    iconName: 'anchor',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Comandante della flotta pirata. Inizia con 14 HP e 2 Potere.',
        en: 'Fleet pirate commander. Starts with 14 HP and 2 Power.',
      },
    },
  },
  {
    id: 'joan',
    name: 'Joan',
    title: {
      it: 'Giovanna d\'Arco - Paladina Sacra',
      en: 'Joan of Arc - Holy Paladin',
    },
    startingHp: 18,
    startingPower: 1,
    maxHp: 18,
    avatarColor: 'yellow',
    iconName: 'sun',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Inviolabile difensrice con 18 HP e 1 Potere.',
        en: 'Stalwart defender with 18 HP and 1 Power.',
      },
    },
  },
  {
    id: 'mordred',
    name: 'Mordred',
    title: {
      it: 'Cavaliere Oscuro',
      en: 'Dark Knight',
    },
    startingHp: 19,
    startingPower: 0,
    maxHp: 19,
    avatarColor: 'slate',
    iconName: 'sword',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Combattente temibile con ben 19 HP e 0 Potere iniziale.',
        en: 'Formidable knight starting with 19 HP and 0 Power.',
      },
    },
  },
  {
    id: 'golem',
    name: 'Golem',
    title: {
      it: 'Titano di Pietra',
      en: 'Stone Titan',
    },
    startingHp: 25,
    startingPower: 1,
    maxHp: 25,
    avatarColor: 'stone',
    iconName: 'mountain',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Il colosso del gioco con 25 HP straordinari e 1 Potere.',
        en: 'Massive juggernaut with a colossal 25 HP and 1 Power.',
      },
    },
  },
  {
    id: 'maman_brijit',
    name: 'Maman Brijit',
    title: {
      it: 'Baronessa Voodoo',
      en: 'Voodoo Baroness',
    },
    startingHp: 16,
    startingPower: 2,
    maxHp: 16,
    avatarColor: 'purple',
    iconName: 'skull',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Mistica ed enigmatica con 16 HP e 2 Potere.',
        en: 'Mystical practitioner starting with 16 HP and 2 Power.',
      },
    },
  },
  {
    id: 'mephisto',
    name: 'Mephisto',
    title: {
      it: 'Il Demone Ingannatore',
      en: 'The Trickster Demon',
    },
    startingHp: 13,
    startingPower: 1,
    maxHp: 13,
    avatarColor: 'red',
    iconName: 'flame',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Astuto e letale con 13 HP e 1 Potere.',
        en: 'Cunning and dangerous with 13 HP and 1 Power.',
      },
    },
  },
  {
    id: 'milady',
    name: 'Milady',
    title: {
      it: 'Nobile Spadaccina',
      en: 'Noble Duelist',
    },
    startingHp: 16,
    startingPower: 1,
    maxHp: 16,
    avatarColor: 'rose',
    iconName: 'sparkle',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Elegante e rapida con 16 HP e 1 Potere.',
        en: 'Graceful duelist with 16 HP and 1 Power.',
      },
    },
  },
  {
    id: 'shango',
    name: 'Shango',
    title: {
      it: 'Dio del Tuono e della Tempesta',
      en: 'God of Thunder & Storms',
    },
    startingHp: 15,
    startingPower: 0,
    maxHp: 15,
    avatarColor: 'blue',
    iconName: 'zap',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Potente signore dei fulmini con 15 HP e 0 Potere iniziale.',
        en: 'Thunder lord starting with 15 HP and 0 Power.',
      },
    },
  },
  {
    id: 'wild_bunch',
    name: 'Wild Bunch',
    title: {
      it: 'Il Mucchio Selvaggio',
      en: 'The Wild Bunch Posse',
    },
    startingHp: 5,
    startingPower: 1,
    maxHp: 5,
    avatarColor: 'emerald',
    iconName: 'users',
    specialMechanic: {
      type: 'wild_bunch',
      description: {
        it: 'All\'avvio del match, l\'eroe alleato nello stesso team riceve automaticamente +1 Potere di partenza.',
        en: 'At match start, their Tag Team ally automatically gains +1 starting power.',
      },
    },
  },
  {
    id: 'fey_folk',
    name: 'The Fey Folk',
    title: {
      it: 'Il Popolo Fatato',
      en: 'The Fey Folk Trio',
    },
    startingHp: 12, // Sum of 5 + 4 + 3
    startingPower: 0,
    maxHp: 12,
    avatarColor: 'teal',
    iconName: 'sparkles',
    specialMechanic: {
      type: 'fey_folk',
      description: {
        it: '3 tracciati HP separati e indipendenti: Elfa (5 HP), Gnomo (4 HP), Fata (3 HP). Il KO scatta quando tutti e 3 vanno a 0 HP.',
        en: '3 separate independent HP tracks: Elf (5 HP), Gnome (4 HP), Fairy (3 HP). KO triggers when all 3 reach 0 HP.',
      },
    },
  },
  {
    id: 'dragon',
    name: 'Dragon',
    title: {
      it: 'Il Drago Antico',
      en: 'The Ancient Dragon',
    },
    startingHp: 20,
    startingPower: 2,
    maxHp: 20,
    avatarColor: 'red',
    iconName: 'flame',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Scaglie Draconiche: Colosso con 20 HP. Usa le scaglie come risorsa difensiva per mitigare i colpi e scatenare fiamme devastanti.',
        en: 'Dragon Scales: Juggernaut starting with 20 HP. Discards scales to absorb damage and empower fiery attacks.',
      },
    },
  },
  {
    id: 'excalibur',
    name: 'Excalibur',
    title: {
      it: 'La Spada nella Roccia',
      en: 'The Sword in the Stone',
    },
    startingHp: 7,
    startingPower: 0,
    maxHp: 7,
    avatarColor: 'yellow',
    iconName: 'sword',
    specialMechanic: {
      type: 'excalibur',
      description: {
        it: 'Lama Spezzata (Immortale): Quando va KO a 0 HP, si trasforma in The Broken Blade e diventa immortale!',
        en: 'The Broken Blade (Immortal): When reduced to 0 HP, transforms into The Broken Blade and becomes immortal!',
      },
    },
  },
  {
    id: 'green_knight',
    name: 'The Green Knight',
    title: {
      it: 'Il Cavaliere Verde',
      en: 'The Green Knight',
    },
    startingHp: 14,
    startingPower: 1,
    maxHp: 14,
    avatarColor: 'emerald',
    iconName: 'shield',
    specialMechanic: {
      type: 'green_knight',
      description: {
        it: 'Sfida Cavalleresca: Le sue abilità riducono i suoi Max HP di 1 alla volta aumentando la sua ferocia.',
        en: 'Chivalric Trial: His combat abilities permanently reduce his Max HP by 1 at a time.',
      },
    },
  },
  {
    id: 'merlin',
    name: 'Merlin',
    title: {
      it: 'L\'Arcimago di Camelot',
      en: 'The Archmage of Camelot',
    },
    startingHp: 14,
    startingPower: 2,
    maxHp: 14,
    avatarColor: 'indigo',
    iconName: 'sparkles',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Albero delle Abilità: Potenzia gradualmente le sue magie (attacchi, parate e cure) creando potenti combinazioni a catena.',
        en: 'Skill Tree: Gradually enhances his spells (attacks, blocks, heals) into devastating late-game chains.',
      },
    },
  },
  {
    id: 'morgan',
    name: 'Morgan',
    title: {
      it: 'L\'Incantatrice Fatata',
      en: 'The Fae Sorceress',
    },
    startingHp: 15,
    startingPower: 1,
    maxHp: 15,
    avatarColor: 'purple',
    iconName: 'sparkle',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Preveggenza: Vede le carte scelte dall\'avversario ed è specializzata in potenti contromisure e hard-counter.',
        en: 'Foresight: Peeks at opponent choices and punishes them with devastating hard-counters.',
      },
    },
  },
  {
    id: 'perceval',
    name: 'Perceval',
    title: {
      it: 'Cavaliere della Tavola Rotonda',
      en: 'Knight of the Round Table',
    },
    startingHp: 15,
    startingPower: 0,
    maxHp: 15,
    avatarColor: 'cyan',
    iconName: 'sword',
    specialMechanic: {
      type: 'none',
      description: {
        it: 'Attacchi a Catena: Infligge danno devastante sommando il Potere al numero di sue carte giocate nel turno.',
        en: 'Chain Attacks: Attacks deal damage scaling with his Power plus the number of his cards played.',
      },
    },
  },
];

export function getHeroById(id: string): Hero | undefined {
  return HEROES.find((h) => h.id === id);
}
