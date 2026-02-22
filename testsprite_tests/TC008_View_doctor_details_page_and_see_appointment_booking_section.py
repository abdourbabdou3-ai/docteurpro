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
        
        # -> Click the 'الأطباء' (Doctors) link to navigate to the doctors list page
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/nav/div/ul/li[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the first doctor card ('عرض الملف') to open the doctor's profile and booking UI (use element index 750).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/section[3]/div/div/div[1]/div[3]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the first doctor card again (element index 750) to open the doctor's profile and reveal the booking UI so the booking-related elements can be verified.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/section[3]/div/div/div[1]/div[3]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Click the 'احجز الآن' (Book Now) button (index 1090) to open the booking form so the 'Patient name' and 'Phone' input fields can be verified.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        frame = context.pages[-1]
        assert "/doctors" in frame.url
        title = await frame.title()
        assert "doctors" in title.lower()
        assert await frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[1]/input').is_visible()
        assert await frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[1]/input').is_visible()
        assert await frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[2]/input').is_visible()
        assert await frame.locator('xpath=/html/body/main/div/div/div[2]/div[2]/form/div[3]/input').is_visible()
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    