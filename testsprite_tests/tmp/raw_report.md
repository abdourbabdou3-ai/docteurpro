
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** docteur
- **Date:** 2026-02-21
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Search doctors from /doctors and verify results list renders doctor cards
- **Test Code:** [TC001_Search_doctors_from_doctors_and_verify_results_list_renders_doctor_cards.py](./TC001_Search_doctors_from_doctors_and_verify_results_list_renders_doctor_cards.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/67b7600d-c35c-4b6d-932c-259e18cf769c
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Search doctors from home page and verify results are displayed
- **Test Code:** [TC002_Search_doctors_from_home_page_and_verify_results_are_displayed.py](./TC002_Search_doctors_from_home_page_and_verify_results_are_displayed.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No doctor cards are displayed after performing a search for city 'الجزائر' (page shows 'لا توجد نتائج').
- Doctor listing page does not display price information because no doctor cards are present.
- Search by specialty/city did not return results; rating and price could not be verified.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/a7d7362d-86e9-4515-9073-f1e6cd238807
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Search with no matches shows 'No results found' message
- **Test Code:** [TC003_Search_with_no_matches_shows_No_results_found_message.py](./TC003_Search_with_no_matches_shows_No_results_found_message.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Search button not found on page
- Specialty field is a restricted dropdown and does not accept arbitrary text input 'تخصص-غير-موجود-999'
- No mechanism found to submit a custom filter search (no visible search/submit button and no clear submit trigger on inputs)
- Unable to verify the presence of a 'No results found' message because a search that would produce an empty result set cannot be performed
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/668a0fbf-7d71-4f3b-b1f2-bbf8c0509137
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Specialty-only search returns doctors and keeps city filter empty
- **Test Code:** [TC004_Specialty_only_search_returns_doctors_and_keeps_city_filter_empty.py](./TC004_Specialty_only_search_returns_doctors_and_keeps_city_filter_empty.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/7f1e317d-2212-4287-80e5-d20d93d1d40b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 City-only search returns doctors and keeps specialty filter empty
- **Test Code:** [TC005_City_only_search_returns_doctors_and_keeps_specialty_filter_empty.py](./TC005_City_only_search_returns_doctors_and_keeps_specialty_filter_empty.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Doctor cards not displayed after performing search with only city 'وهران' — the page shows the message 'لا توجد نتائج'.
- Specialty field default is 'جميع التخصصات' (not required), yet the search with only a city still returned no results.
- No visible server or API error (500) was shown; the UI returned an empty results state instead of populated doctor cards.
- Search submission was performed (city input filled and Enter pressed) but no doctor entries or related rating/price elements were rendered.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/393106ec-5240-4c8e-b91f-6ba6ab57d95b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Clear/empty search does not crash and still renders a listing state
- **Test Code:** [TC006_Clearempty_search_does_not_crash_and_still_renders_a_listing_state.py](./TC006_Clearempty_search_does_not_crash_and_still_renders_a_listing_state.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/0d34c8bf-ad27-49d1-9cc5-b6f7e7713b7d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Search handles Arabic input and whitespace robustly
- **Test Code:** [TC007_Search_handles_Arabic_input_and_whitespace_robustly.py](./TC007_Search_handles_Arabic_input_and_whitespace_robustly.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Specialty free-text input field not found on the /doctors page; only a select dropdown (index 340) is available.
- The UI control for selecting a specialty is a <select> element, which does not permit typing a value with leading/trailing spaces (e.g., '  جلدية  '), so the requested input-based test cannot be executed.
- The requested verification (type '  جلدية  ' and observe UI stability/response) could not be performed due to the missing free-text specialty field.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/c5b6b22d-d13a-4c24-b889-f9cfe9b74ca7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 View doctor details page and see appointment booking section
- **Test Code:** [TC008_View_doctor_details_page_and_see_appointment_booking_section.py](./TC008_View_doctor_details_page_and_see_appointment_booking_section.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/748103ef-9ad5-4a22-b9cd-1cb18c68b227
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Successful booking flow up to confirmation (if backend available)
- **Test Code:** [TC009_Successful_booking_flow_up_to_confirmation_if_backend_available.py](./TC009_Successful_booking_flow_up_to_confirmation_if_backend_available.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Booking confirmation message 'Booking confirmed' not found on page after submitting booking.
- Confirm booking button was clicked (one or more times) but no success UI or confirmation text was rendered.
- Booking form inputs remained filled (date=2026-02-22, name='Test Patient', phone='0555123456'), indicating the form was not cleared or navigated to a confirmation view.
- No visible server error (500) or explicit error message is shown, suggesting the issue is lack of a visible success response or missing confirmation UI.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/3d27d554-c213-44ef-8476-69406c31f9db
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Phone is required validation when confirming booking
- **Test Code:** [TC010_Phone_is_required_validation_when_confirming_booking.py](./TC010_Phone_is_required_validation_when_confirming_booking.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/3e95306f-5be0-4035-9169-f28c50d1d872
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Cannot confirm booking without selecting a time slot
- **Test Code:** [TC011_Cannot_confirm_booking_without_selecting_a_time_slot.py](./TC011_Cannot_confirm_booking_without_selecting_a_time_slot.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Attempted booking submission was not executed: the Cancel (إلغاء) button was clicked instead of the Confirm (تأكيد الحجز) button during submission attempts, so no submission occurred.
- No client-side validation message indicating a missing date/time (e.g., 'Select a date and time' or Arabic equivalents such as 'اختر تاريخ ووقت', 'الرجاء تحديد التاريخ والوقت') was displayed on the page after the failed submission attempts.
- The booking form shows the name field populated with 'Test Patient' and the phone field populated with '0555123456', but the date input remained empty/invalid and no validation feedback was triggered.
- The first doctor's 'عرض الملف' button (index 754) failed to open the booking form when clicked (2 attempts), requiring use of the separate 'احجز الآن' button to access the form.
- Because the submission action was never successfully executed, it is not possible to confirm whether the system enforces server-side blocking of bookings without a date/time selection.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/44215e1d-1a37-4ea0-a9c7-0fb0df9fff00
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Phone field rejects obviously invalid short value (client-side validation)
- **Test Code:** [TC012_Phone_field_rejects_obviously_invalid_short_value_client_side_validation.py](./TC012_Phone_field_rejects_obviously_invalid_short_value_client_side_validation.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Confirm booking button not found on booking form; only 'إلغاء' (cancel) button is present (index 1184).
- Unable to submit booking because no accessible submit/confirm control is available on the booking form.
- No visible validation message 'Invalid phone' was displayed after entering phone value '123'.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/1394d08e-a8cc-4dbe-b1fd-e5bb31397f2f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Login then open Doctor Dashboard and see core dashboard UI
- **Test Code:** [TC013_Login_then_open_Doctor_Dashboard_and_see_core_dashboard_UI.py](./TC013_Login_then_open_Doctor_Dashboard_and_see_core_dashboard_UI.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Current URL is '/admin' instead of expected '/dashboard' (doctor dashboard not reached).
- Dashboard page displays admin heading 'لوحة تحكم الإدارة' indicating the admin panel loaded rather than a doctor dashboard.
- Expected text 'إحصائيات' not found on the page.
- Expected text 'المواعيد القادمة' not found on the page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/84600096-9679-4f71-ad1b-e94000735cf7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Confirm an upcoming appointment from its details card
- **Test Code:** [TC014_Confirm_an_upcoming_appointment_from_its_details_card.py](./TC014_Confirm_an_upcoming_appointment_from_its_details_card.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Appointments list or upcoming appointment card not found on admin dashboard or doctors page
- No 'تأكيد' (Confirm) button or equivalent appointment confirmation control present in the UI
- No navigation link or menu item labeled 'مواعيد' (Appointments) found to access upcoming appointments
- Unable to complete verification because the appointment confirmation feature is not available in the accessible interface
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/f881b298-825e-4c8f-acfa-8ce8848ae0bb
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Cancel an upcoming appointment from its details card
- **Test Code:** [TC015_Cancel_an_upcoming_appointment_from_its_details_card.py](./TC015_Cancel_an_upcoming_appointment_from_its_details_card.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Appointment management UI for doctors not accessible from admin: no 'Appointments' ('المواعيد') link or menu item found.
- No upcoming appointment cards visible on the current admin doctors page; doctor entries or appointment lists are empty.
- No 'إلغاء' (Cancel) button present on any visible element to cancel appointments.
- No option to impersonate or navigate to a doctor's dashboard to perform appointment cancellation was found.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/6cf4fa25-9cbd-4edb-9261-4d2c6a1149e3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Complete an appointment when the option is available
- **Test Code:** [TC016_Complete_an_appointment_when_the_option_is_available.py](./TC016_Complete_an_appointment_when_the_option_is_available.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Doctor-facing appointment UI not reachable from admin session: no link or impersonate control to open a doctor's view was found on the admin pages.
- No upcoming appointment cards or appointment list are visible on the current 'إدارة الأطباء' (Doctors) admin page.
- No 'إكمال' (Complete) button or equivalent appointment-completion control is present on the pages accessible in this session.
- Unable to verify the 'مكتمل' status because the required doctor interface or appointment entries are not accessible from the current account.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/76b4531b-5c5a-4ae0-a649-901358c115e0
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Update doctor profile settings from the dashboard
- **Test Code:** [TC017_Update_doctor_profile_settings_from_the_dashboard.py](./TC017_Update_doctor_profile_settings_from_the_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/f1091c03-76b1-4dc4-a3fa-8469d01ee8c7
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Update working hours from the dashboard
- **Test Code:** [TC018_Update_working_hours_from_the_dashboard.py](./TC018_Update_working_hours_from_the_dashboard.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- 'ساعات العمل' link/button not found on the doctors management page.
- Search for the text 'ساعات العمل' on the page returned no matches.
- No visible control in doctor rows or actions to open working hours for any doctor.
- Cannot verify the success message 'تم الحفظ' because the working-hours feature is not accessible.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/449d7f5d-9f0c-44d8-9fd6-6163f124ba34
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Admin approves a doctor application and sees status updated
- **Test Code:** [TC019_Admin_approves_a_doctor_application_and_sees_status_updated.py](./TC019_Admin_approves_a_doctor_application_and_sees_status_updated.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No pending doctor applications found on /admin/doctors?status=pending — the page displays 'لا يوجد أطباء'.
- Approval button not found on page because there are no doctor rows available to act upon.
- Verification of a status change to 'approved' could not be completed because no application existed to approve.
- Admin panel route loaded successfully but lacked the test data required for the approval workflow.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/2e968e7e-bf31-40d9-ac2e-7ae474e5f7ba
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Admin views doctor applications list (happy path visibility check)
- **Test Code:** [TC020_Admin_views_doctor_applications_list_happy_path_visibility_check.py](./TC020_Admin_views_doctor_applications_list_happy_path_visibility_check.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/bfcf0031-e7d0-4785-8b19-46c0796aae27
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Admin approves a doctor application from the applications list
- **Test Code:** [TC021_Admin_approves_a_doctor_application_from_the_applications_list.py](./TC021_Admin_approves_a_doctor_application_from_the_applications_list.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No pending doctor entries found on the /admin/doctors?status=pending page; the pending list is empty, so there is nothing to approve.
- No "Approve" button or equivalent approval control is present in the pending doctors view, preventing performing the approval action.
- Unable to verify the post-approval text 'تمت الموافقة' because the approval action could not be performed due to missing UI elements.
- Admin approval functionality may be hidden behind additional interactions, require different permissions, or there are no pending applications in the test data.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/28fc35a5-0f3b-4d10-80ec-9df6b6777285
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Admin updates a subscription package and sees confirmation
- **Test Code:** [TC022_Admin_updates_a_subscription_package_and_sees_confirmation.py](./TC022_Admin_updates_a_subscription_package_and_sees_confirmation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/87ccf642-ef23-4e7b-ba80-8d4b167b1700
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC023 Admin saves subscription package changes and sees updated values
- **Test Code:** [TC023_Admin_saves_subscription_package_changes_and_sees_updated_values.py](./TC023_Admin_saves_subscription_package_changes_and_sees_updated_values.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Success message 'تم التحديث بنجاح' not found on page after saving edits.
- No confirmation toast or visible success message appeared after two save attempts.
- Updated package details (e.g., price, storage, max appointments) could not be verified in the packages list after reopening the edit modal.
- Edit modal save actions were triggered but did not produce a visible success confirmation, preventing verification of the update.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/4966009e-0703-4558-aa85-cf51839b6167
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC024 Non-admin user is blocked from accessing the admin panel (permissions)
- **Test Code:** [TC024_Non_admin_user_is_blocked_from_accessing_the_admin_panel_permissions.py](./TC024_Non_admin_user_is_blocked_from_accessing_the_admin_panel_permissions.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login did not succeed with provided non-admin credentials - the login form remained visible after submitting the credentials.
- Navigation to /admin did not show a 403 or insufficient-permissions page - the application redirected to the login page instead.
- Text 'غير مصرح' was not found on the page after attempting to access /admin.
- Text '403' was not found on the page after attempting to access /admin.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/405b1917-7c8a-49cc-88f5-53d2328884a5
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC025 Admin sees a loading indicator before admin data renders
- **Test Code:** [TC025_Admin_sees_a_loading_indicator_before_admin_data_renders.py](./TC025_Admin_sees_a_loading_indicator_before_admin_data_renders.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Loading text 'جار التحميل' not displayed during admin data fetch; no visible loading indicator found.
- Admin dashboard content rendered immediately, preventing observation of a loading state.
- No alternate loading indicator (spinner, skeleton, or similar text) was detected in the visible UI.
- Unable to verify a transition from loading to content because the initial loading state is absent.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0d76f9c7-e620-4fd6-b06f-32c83292025c/ad2421b9-19f0-4ddf-8c22-faa916aa138b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **32.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---