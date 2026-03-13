// lead.model.ts

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  ville: Ville;
  source: LeadSource;
  jobTitle?: string;
  assignedTo?: string;
  assignedToId?: number;
  createdAt: Date;
  updatedAt: Date;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  isDuplicate?: boolean;
  duplicateOf?: number;
  itemId: number;
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  REFERRAL = 'REFERRAL',
  IMPORT = 'IMPORT',
  SOCIAL = 'SOCIAL',
  TRADE_SHOW = 'TRADE_SHOW',
  OTHER = 'OTHER'
}

export enum Ville {
  CASABLANCA = 'Casablanca',
  RABAT = 'Rabat',
  SALE = 'Salé',
  TEMARA = 'Témara',
  KENITRA = 'Kénitra',

  MARRAKECH = 'Marrakech',
  ESSAOUIRA = 'Essaouira',
  SAFI = 'Safi',

  FES = 'Fes',
  MEKNES = 'Meknès',
  IFRANE = 'Ifrane',
  SEFROU = 'Sefrou',

  TANGER = 'Tanger',
  TETOUAN = 'Tétouan',
  LARACHE = 'Larache',
  AL_HOCEIMA = 'Al Hoceïma',

  OUJDA = 'Oujda',
  NADOR = 'Nador',
  BERKANE = 'Berkane',

  AGADIR = 'Agadir',
  TAROUDANT = 'Taroudant',
  TIZNIT = 'Tiznit',

  BENI_MELLAL = 'Béni Mellal',
  KHENIFRA = 'Khénifra',

  ER_RACHIDIA = 'Errachidia',
  OUARZAZATE = 'Ouarzazate',

  GUELMIM = 'Guelmim',
  TAN_TAN = 'Tan-Tan',

  LAAYOUNE = 'Laâyoune',
  DAKHLA = 'Dakhla',

  EL_JADIDA = 'El Jadida',
  SETTAT = 'Settat',
  MOHAMMEDIA = 'Mohammedia',
  BERRECHID = 'Berrechid',

  KHOURIBGA = 'Khouribga'
}

export interface BulkAssignmentRule {
  criteria: 'ville' | 'source';
  value: any;
  assignTo: string;
  description?: string;
}