import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CreatePollRequest {
  'duration' : bigint,
  'question' : string,
  'options' : Array<string>,
}
export interface Poll {
  'id' : PollId,
  'creator' : UserId,
  'question' : string,
  'votes' : Array<bigint>,
  'voters' : Array<UserId>,
  'created_at' : bigint,
  'expires_at' : bigint,
  'options' : Array<string>,
}
export type PollId = bigint;
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : Poll } |
  { 'err' : string };
export type Result_2 = { 'ok' : PollId } |
  { 'err' : string };
export type UserId = Principal;
export interface VoteRequest { 'poll_id' : PollId, 'option_index' : bigint }
export interface _SERVICE {
  'create_poll' : ActorMethod<[CreatePollRequest], Result_2>,
  'get_poll' : ActorMethod<[PollId], Result_1>,
  'list_polls' : ActorMethod<[], Array<Poll>>,
  'vote' : ActorMethod<[VoteRequest], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
