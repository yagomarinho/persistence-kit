# persistence-kit

This repository groups the **persistence-related code and patterns** I use across my projects.

It exists to centralize how data access is handled, including repositories, transactions, and persistence boundaries, while keeping this logic clearly separated from the domain layer.

## Purpose

The goal of this repository is to provide a consistent approach to persistence without leaking infrastructure concerns into domain code.

It acts as a toolkit rather than a framework, allowing each project to adapt the persistence layer to its own needs while following the same core principles.

## What lives here

- Repository patterns and base implementations
- Transaction handling and unit-of-work–like abstractions
- Persistence helpers and shared utilities
- Clear contracts between domain and persistence layers

## What it intentionally avoids

- Business or domain logic
- Framework-specific abstractions leaking into the domain
- One-size-fits-all persistence solutions

## How I use it

I use `persistence-kit` as a shared reference and foundation when implementing data access across different modules and projects.  
It helps reduce duplication, align architectural decisions, and keep persistence concerns predictable and explicit.

---

This repository reflects my current approach to persistence and evolves as those practices change.
