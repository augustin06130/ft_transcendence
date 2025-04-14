import { p, div, ul, li, h1, h2 } from '@framework/tags';

export default function PrivacyPolicy() {
    return div(
        {
            className:
                'p-4 mx-auto border border-green-500/30 rounded p-4 flex-auto max-w-4xl text-green-500 text-sm leading-relaxed',
        },
        h1({ className: 'text-green-300 text-3xl font-bold mb-4' }, 'Privacy Policy'),
        p({}, `Effective Date: ${(new Date).toLocaleDateString()}`),

        p(
            {},
            'Welcome to ft_transcendence (https://www.ft_transcendence.42.fr/). This Privacy Policy explains how we collect, use, and protect your data, in accordance with the GDPR.'
        ),

        h2({ className: 'text-green-400 text-xl font-semibold mt-6' }, '1. Who We Are'),
        p({}, 'This website is operated by the ft_transcendence team.'),
        p({}, 'Contact us at: ft_transcendence@contact.fr'),

        h2(
            { className: 'text-green-400 text-xl font-semibold mt-6' },
            '2. What Data We Collect and Why'
        ),

        p({}, 'We collect the following types of data:'),

        ul(
            {},
            li({}, 'Username (required): to identify users and display in-game.'),
            li({}, 'Email (optional): for account recovery and optional contact.'),
            li({}, 'Bio & Picture (optional): part of your public profile.'),
            li({}, 'Google ID: used for login via Google OAuth (not visible to other users).')
        ),

        p({}, 'Game-related data we collect includes:'),

        ul(
            {},
            li({}, 'Game duration, date, score, rally count.'),
            li({}, 'Usernames of both players involved in a game.')
        ),

        h2({ className: 'text-green-400 text-xl font-semibold mt-6' }, '3. Cookies'),

        p({}, 'We use cookies only for essential purposes:'),
        ul(
            {},
            li({}, 'To remember cookie consent'),
            li({}, 'To store your username'),
            li({}, 'To keep you logged in via 2fa')
        ),
        p({}, 'We do not use cookies for advertising or analytics.'),

        h2({ className: 'text-green-400 text-xl font-semibold mt-6' }, '4. Who Can See Your Data'),

        ul(
            {},
            li({}, 'Your username, bio, and picture are visible to all users.'),
            li({}, 'Your email and Google ID are private and never shared.'),
            li({}, 'Your game stats is visible on Match History.'),
            li({}, 'Friends can see your online status and room ID.')
        ),

        h2(
            { className: 'text-green-400 text-xl font-semibold mt-6' },
            '5. Legal Basis for Processing'
        ),
        p({}, 'We process data based on:'),
        ul(
            {},
            li({}, 'Consent (for optional info like email, bio, picture)'),
            li({}, 'Contractual necessity (to provide the game features)'),
            li({}, 'Legitimate interests (for user interaction and gameplay tracking)')
        ),

        h2({ className: 'text-green-400 text-xl font-semibold mt-6' }, '6. Data Retention'),
        p(
            {},
            'We retain your data while your account is active. Accounts are marked inactive after 1 year without login. Upon deletion, all personal data is removed within 30 days, unless legally required otherwise.'
        ),

        h2({ className: 'text-green-400 text-xl font-semibold mt-6' }, '7. Your Rights'),
        p({}, 'As an EU user, you have the right to:'),
        ul(
            {},
            li({}, 'Access your personal data'),
            li({}, 'Correct or delete your data'),
            li({}, 'Withdraw consent'),
            li({}, 'Object to or restrict processing'),
            li({}, 'File a complaint with a data authority')
        ),
        p({}, 'To exercise any rights, email us at ft_transcendence@contact.fr.'),

        h2({ className: 'text-green-400 text-xl font-semibold mt-6' }, '8. Children’s Privacy'),
        p({}, 'We do not knowingly collect data from children under 16 without parental consent.'),

        h2({ className: 'text-green-400 text-xl font-semibold mt-6' }, '9. Data Security'),
        p({}, 'We apply appropriate technical and organizational measures to protect your data.'),

        h2(
            { className: 'text-green-400 text-xl font-semibold mt-6' },
            '10. Hosting and International Access'
        ),
        p(
            {},
            'Our servers are located in the EU. All data is processed under GDPR standards, regardless of where you access the service from.'
        ),

        h2(
            { className: 'text-green-400 text-xl font-semibold mt-6' },
            '11. Changes to This Policy'
        ),
        p(
            {},
            'We may update this Privacy Policy. Material changes will be communicated via the website.'
        )
    );
}
