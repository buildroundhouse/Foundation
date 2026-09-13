# Roundhouse Universal Record System

This contract governs all created, historical, transactional, uploaded, or shared data in Roundhouse.

## Independent records

Photos, notations, receipts, estimates, invoices, payments, messages, documents, Vault items, work logs, work requests, tasks, lists, reminders, schedule events, Resolutions, maintenance, standards, asset history, approvals, invitations, and handoffs are independent canonical records.

A record can appear in several profiles, properties, businesses, timelines, or working surfaces. Each appearance is a link to the same record. Roundhouse must never create separate copies merely because the record appears in several places.

Attachments belong to their record. They are not stored inside a profile, property, or business.

## Direct information

Only current identity and configuration information lives directly on a profile, property, or business. Examples include its current name, address, phone number, logo, description, and permission configuration.

Changing direct information creates an independent history record when an audit trail is required. The current value remains on the destination; its history does not.

## Removal and retention

Removing a link affects only that appearance. It never deletes the canonical record, its attachments, or its other links.

A real property is not hard-deleted. It may be active, unclaimed, or archived. Property-history links marked to survive archival remain connected to the permanent property record through ownership and access changes.

Private personal notes and internal business records do not become property history merely because they concern work at that address. Publishing a record into permanent property history must be deliberate.

## Ownership changes and attribution

When a later owner claims the same real property, eligible permanent history remains available: what was done, when it occurred, materials and specifications, maintenance history, and any transferable documents or attachments.

Creator identity is retained privately for integrity. Its visibility is controlled separately from the work facts. A future owner may see neutral attribution such as “previous owner’s team” unless consent, warranties, permits, dispute handling, or legal requirements require greater disclosure.

The product must not present attribution controls as protection from legitimate legal responsibility.

## Implementation invariant

Deleting, archiving, unclaiming, or disconnecting a profile, property, or business must never cascade-delete an independent Roundhouse record.
