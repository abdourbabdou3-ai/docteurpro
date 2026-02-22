import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3000
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # -> Click the 'الأطباء' link to navigate to the doctors list (/doctors). ASSERTION: 'الأطباء' navigation link is visible on the homepage.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/nav/div/ul/li[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click on the first doctor card's 'عرض الملف' button (element index 750) to open the doctor's profile and booking UI.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/section[3]/div/div/div[1]/div[3]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the 'احجز الآن' (Book Now) button to open the booking form (index 911). ASSERTION: clicking this should open the booking form/modal with date/time and patient fields.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Enter a date into the date field (index 986), fill 'Test Patient' into the full name field (index 988), then click the 'تأكيد الحجز' (Confirm booking) button (index 1002). After the click, check for the validation message 'Phone is required'.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[1]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('2026-02-22')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test Patient')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[6]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Open the booking form, enter only the patient name (leave phone blank), submit the booking, and verify that a visible validation error indicating the phone field is required appears. ASSERTION: Submitting the booking without a phone should produce a phone-required validation message.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Select an available time slot, clear the phone input (leave phone blank), locate/reveal the 'تأكيد الحجز' (Confirm booking) button, click it to submit, then verify that a visible validation message indicating the phone is required appears.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[2]/div/button[7]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[4]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('')
        
        # -> Click the 'تأكيد الحجز' (Confirm booking) button (index 1172) to submit the form with an empty phone field, then check for a visible validation message indicating the phone is required.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[7]/button[1]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        # Verify the phone input exists and is empty (we left it blank in prior steps)
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[4]/input').nth(0)
        assert await elem.is_visible(), 'Phone input is not visible; cannot verify phone-required validation'
        phone_value = await elem.input_value()
        assert phone_value == '', f"Expected phone input to be empty before submission, but has value: {phone_value}"
        # Ensure booking form is present by checking the Cancel button
        cancel_btn = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[7]/button[2]').nth(0)
        assert await cancel_btn.is_visible(), 'Booking form does not appear to be open (Cancel button not visible)',
        # The expected validation message element with text "Phone is required" is not present in the available elements for this page. Report the missing feature.
        raise AssertionError("Validation message 'Phone is required' not found on the page. The phone-required validation message or its element appears to be missing; reporting the issue and marking the task done.")
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    