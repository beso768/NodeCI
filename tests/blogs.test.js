const Page = require('./helpers/page')

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
})

afterEach(async() => {
    await page.close()
})


describe('When logged in', () => {
    beforeEach(async() => {
        await page.login();
        await page.click('.fixed-action-btn a');
    });
    test('When click on button "+" , redirect on form page',async () => {
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title')
    })
    describe('When using valid form inputs', () => {
        const title = 'title';
        const content = 'content';
        beforeEach(async () => {
            await page.type('.title input', title)
            await page.type('.content input', content)
            await page.click('form button');
        })
        test('Submitting takes user to a review screen',async () => {
            const headerContent = await page.getContentsOf('form h5');
            expect(headerContent).toEqual('Please confirm your entries');
        })
        test('Submitting then saving adds blog to index page',async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const titleText = await page.getContentsOf('.card-content .card-title');
            const contentText = await page.getContentsOf('.card-content p');
            expect(titleText).toEqual(title);
            expect(contentText).toEqual(content);
        })
    })
    describe('When using invalid form inputs',  () => {
        test('Form shows error messages',async () => {
            await page.type('.title input', '')
            await page.type('.content input', '')
            await page.click('form button');
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')
        })
    })

})


describe('When user is not logged in',() => {
    test('Use cannot crate blog post', async () => {
        const result = await page.post('/api/blogs',{title: 'T', content: 'C'})
        expect(result).toEqual({ error: 'You must log in!' });
    })
    test('Use cannot see blog post', async () => {
        const result = await page.get('/api/blogs');
        expect(result).toEqual({ error: 'You must log in!' });
    })
})

