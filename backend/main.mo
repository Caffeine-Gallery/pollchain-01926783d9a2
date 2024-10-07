import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import Int "mo:base/Int";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
    // Types
    type UserId = Principal;
    type PollId = Nat;

    type Poll = {
        id: PollId;
        creator: UserId;
        question: Text;
        options: [Text];
        votes: [Nat];
        voters: [UserId];
        created_at: Int;
        expires_at: Int;
    };

    type CreatePollRequest = {
        question: Text;
        options: [Text];
        duration: Nat; // Duration in seconds
    };

    type VoteRequest = {
        poll_id: PollId;
        option_index: Nat;
    };

    // State
    stable var next_poll_id: PollId = 0;
    let polls = HashMap.HashMap<PollId, Poll>(0, Nat.equal, Hash.hash);

    // Helper functions
    func is_poll_active(poll: Poll): Bool {
        let current_time = Time.now();
        current_time <= poll.expires_at
    };

    func has_user_voted(poll: Poll, user: UserId): Bool {
        Option.isSome(Array.find<UserId>(poll.voters, func (voter) { voter == user }))
    };

    // Public functions
    public shared(msg) func create_poll(request: CreatePollRequest): async Result.Result<PollId, Text> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous users cannot create polls");
        };

        let poll_id = next_poll_id;
        next_poll_id += 1;

        let current_time = Time.now();
        let expires_at = current_time + (request.duration * 1_000_000_000);

        let new_poll: Poll = {
            id = poll_id;
            creator = caller;
            question = request.question;
            options = request.options;
            votes = Array.tabulate<Nat>(request.options.size(), func(_) { 0 });
            voters = [];
            created_at = current_time;
            expires_at = expires_at;
        };

        polls.put(poll_id, new_poll);
        #ok(poll_id)
    };

    public shared(msg) func vote(request: VoteRequest): async Result.Result<(), Text> {
        let caller = msg.caller;
        if (Principal.isAnonymous(caller)) {
            return #err("Anonymous users cannot vote");
        };

        switch (polls.get(request.poll_id)) {
            case (null) {
                #err("Poll not found")
            };
            case (?poll) {
                if (not is_poll_active(poll)) {
                    return #err("Poll has expired");
                };

                if (has_user_voted(poll, caller)) {
                    return #err("User has already voted");
                };

                if (request.option_index >= poll.options.size()) {
                    return #err("Invalid option index");
                };

                var updated_votes = Array.tabulate<Nat>(poll.votes.size(), func(i) {
                    if (i == request.option_index) {
                        poll.votes[i] + 1
                    } else {
                        poll.votes[i]
                    }
                });

                let updated_poll: Poll = {
                    id = poll.id;
                    creator = poll.creator;
                    question = poll.question;
                    options = poll.options;
                    votes = updated_votes;
                    voters = Array.append(poll.voters, [caller]);
                    created_at = poll.created_at;
                    expires_at = poll.expires_at;
                };

                polls.put(request.poll_id, updated_poll);
                #ok()
            };
        }
    };

    public query func get_poll(poll_id: PollId): async Result.Result<Poll, Text> {
        switch (polls.get(poll_id)) {
            case (null) { #err("Poll not found") };
            case (?poll) { #ok(poll) };
        }
    };

    public query func list_polls(): async [Poll] {
        Iter.toArray(polls.vals())
    };

    // System functions
    system func preupgrade() {
        // Implement if needed
    };

    system func postupgrade() {
        // Implement if needed
    };
}
