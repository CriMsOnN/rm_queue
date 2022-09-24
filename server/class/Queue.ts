import { QueueProps, GraceProps } from '../types';

export class Queue {
  private queueMax: number = 1;
  private queueList: QueueProps[] = [];
  private graceList: GraceProps[] = [];
  private loadingPlayers: number[] = [];

  constructor(queueMax: number) {
    this.queueMax = queueMax;
  }

  public addPlayerToLoading(source: number): void {
    this.loadingPlayers.push(source);
  }

  public removePlayerFromLoading(source: number): void {
    this.loadingPlayers = this.loadingPlayers.filter((player) => player !== source);
  }

  public isPlayerLoading(source: number): boolean {
    return this.loadingPlayers.some((player) => player === source);
  }

  public getPlayersInLoadingState(): number[] {
    return this.loadingPlayers;
  }

  public getSize(): number {
    return this.queueList.length;
  }

  public getQueueList(): QueueProps[] {
    return this.queueList;
  }

  public getQueueMax(): number {
    return this.queueMax;
  }

  public isQueueFull(): boolean {
    return this.queueList.length >= this.queueMax;
  }

  public isQueueEmpty(): boolean {
    return this.queueList.length === 0;
  }

  public enqueue(queue: QueueProps): number {
    if (this.isQueueFull()) {
      throw new Error('Queue is full');
    }

    if (this.isQueueEmpty() || queue.priority <= this.queueList[this.queueList.length - 1].priority) {
      this.queueList.push(queue);
    } else {
      for (let index in this.queueList) {
        if (queue.priority > this.queueList[index].priority) {
          this.queueList.splice(Number(index), 0, queue);
          break;
        }
      }
    }
    return this.queueList.length;
  }

  public dequeue(identifier: string): void {
    this.queueList = this.queueList.filter((queue) => queue.identifier !== identifier);
  }

  public getPlayerPosition(identifier: string): number {
    return this.queueList.findIndex((queue) => queue.identifier === identifier);
  }

  public isPlayerAtFirstPotision(identifier: string): boolean {
    return this.getPlayerPosition(identifier) === 0;
  }

  public addPlayerToGraceList(source: number, identifier: string): void {
    const player: GraceProps = {
      identifier: identifier,
      time: GetGameTimer(),
    };
    this.graceList.push(player);
  }

  public doesPlayerHaveGrace(identifier: string): boolean {
    return this.graceList.some((queue) => queue.identifier === identifier);
  }

  public getPlayerGraceTime(identifier: string): number {
    const player = this.graceList.find((queue) => queue.identifier === identifier);
    if (player) {
      return player.time;
    }
    return 0;
  }

  public changePlayerPriority(identifier: string, priority: number): void {
    const player = this.queueList.find((queue) => queue.identifier === identifier);
    if (player) {
      player.priority = priority;
    }
    this.queueList = this.queueList.sort((a, b) => (b.priority as number) - (a.priority as number));
  }

  public removePlayerFromGrace(identifier: string): void {
    this.graceList = this.graceList.filter((queue) => queue.identifier !== identifier);
  }

  public skipQueue(tempId: number): void {
    const player = this.queueList.find((queue) => queue.tempId !== tempId);
    if (player) {
      player.skipQueue = true;
    }
  }

  public canPlayerSkipQueue(identifier: string): boolean {
    const player = this.queueList.find((queue) => queue.identifier === identifier);
    if (player) {
      return player.skipQueue;
    }
    return false;
  }
}
