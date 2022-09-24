export type Deferrals = {
  defer: () => void;
  update: (message: string) => void;
  presentCard: (card: adaptiveCard) => void;
  done: (message?: string) => void;
};

export type adaptiveCard = {
  type: string;
  body: adaptiveBody[];
};

export type adaptiveBody = {
  type: string;
  url?: string;
  items: adaptiveItems[];
};

export type adaptiveItems = {
  type: string;
  text: string;
  weight: string;
  size: string;
};

export type configProps = {
  graceTime: number;
  useExternal: boolean;
  connectingExport: string;
  connectingResource: string;
  queueSize: number;
  slowLoadingNumber: number;
  adaptiveCardImages: string[];
  adaptivedWelcomeMessage: string;
};

export type userProps = {
  identifier: string;
  priority: number;
  expires: string;
};

export type QueueProps = {
  name: string;
  identifier: string;
  tempId: number | string;
  priority: number | Pick<userProps, 'priority'>;
  skipQueue: boolean;
};

export type GraceProps = Pick<QueueProps, 'identifier'> & {
  time: number;
};
