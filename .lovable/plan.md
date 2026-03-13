

# Photo Upload + Platform Shortcomings Fix

## Critical Missing Feature: Photo Upload

The listing modals across PropertyPage, StaysPage, VehiclesPage, and EventsPage have **no photo upload field at all**. Users cannot attach images when creating listings. The profile section in DashboardPage also lacks an avatar upload.

## All Identified Shortcomings

| Area | Issue |
|------|-------|
| **Photo Upload** | No image upload in any listing modal or profile section |
| **Storage** | No storage bucket exists for user-uploaded files |
| **Listing Forms** | All inputs are uncontrolled — form data is never captured or submitted to the database |
| **Wanted Ads** | Still gated behind `owner`/`broker` role check (line 73 of PropertyPage) |
| **Social Page** | No ShareButtons integration — still uses basic emoji share button |
| **Search Page** | SearchResultsPage exists but no global search bar in Header |
| **Profile Avatar** | Dashboard profile section has no avatar upload |
| **404 Image** | NotFound page likely uses emoji instead of a proper illustration |
| **Mobile UX** | Mobile menu doesn't include dark mode toggle or notification bell |
| **Listing Detail** | No "back to top" or breadcrumb navigation in detail modals |

---

## Implementation Plan

### 1. Create Storage Bucket (Migration)
Create a `listings` storage bucket for property/stay/vehicle/event photos, and a `avatars` bucket for profile pictures. Add RLS policies so authenticated users can upload to their own folder.

### 2. Build Reusable ImageUpload Component
Create `src/components/ImageUpload.tsx`:
- Drag-and-drop zone + click-to-browse
- Preview thumbnails with remove button
- Supports multiple images (up to 5 for listings, 1 for avatar)
- Uploads to storage bucket, returns public URLs
- Shows upload progress

### 3. Add Photo Upload to All Listing Modals
- **PropertyPage** listing modal: Add ImageUpload below Description field (up to 5 photos)
- **PropertyPage** wanted ad modal: Add single photo upload (optional)
- Make all form inputs controlled with proper state
- **StaysPage**: Add "List Stay" button for stay_provider role with full form + photo upload
- **VehiclesPage**: Add "List Vehicle" button for owner role with form + photo upload  
- **EventsPage**: Add "Create Event" button for event_organizer role with form + photo upload

### 4. Add Avatar Upload to Dashboard Profile
In DashboardPage profile section, add an avatar upload circle that uploads to the `avatars` bucket and updates the profile record.

### 5. Fix Remaining Shortcomings
- **PropertyPage line 73**: Remove role restriction on "List Property" button (was supposed to be done already but the guard is still there)
- **SocialPage**: Replace basic share emoji with `ShareButtons` component on each post
- **Header mobile menu**: Add dark mode toggle and notification bell
- **Global search**: Add search input to Header that navigates to `/search?q=...`

### 6. Make Listing Forms Functional
Convert all listing modal inputs from uncontrolled to controlled React state so the form data is actually captured. Wire the submit handler to insert into a new `listings` database table (or at minimum store in local state and show in the UI).

---

## Files Summary

| Action | File |
|--------|------|
| Create | `src/components/ImageUpload.tsx` |
| Create | DB migration — `listings` + `avatars` storage buckets |
| Edit | `src/pages/PropertyPage.tsx` — photo upload in listing/wanted modals, remove role guard, controlled form |
| Edit | `src/pages/StaysPage.tsx` — add "List Stay" button + modal with photo upload |
| Edit | `src/pages/VehiclesPage.tsx` — add "List Vehicle" button + modal with photo upload |
| Edit | `src/pages/EventsPage.tsx` — add "Create Event" button + modal with photo upload |
| Edit | `src/pages/DashboardPage.tsx` — avatar upload in profile section |
| Edit | `src/pages/SocialPage.tsx` — integrate ShareButtons |
| Edit | `src/components/Header.tsx` — add search bar, mobile dark mode + notifications |

