// Types shared between the web app and the api. One source of truth for the
// shapes that cross the network, so the frontend and backend can't drift apart.

export interface Counter {
  id: number;
  name: string;
  count: number;
}
