<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Contribution;
use App\Models\Event;
use App\Models\Feedback;
use App\Models\LearningModule;
use App\Models\MediaItem;
use App\Models\QuizQuestion;
use App\Models\QuizResult;
use App\Models\RepositoryItem;
use App\Models\Story;
use App\Models\User;
use App\Models\VocabularyWord;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ---- System settings (editable from Super Admin → Settings) ----
        \App\Models\Setting::set('site_name', 'EPANAW BAGOBO');
        \App\Models\Setting::set('tagline', 'Preserve. Revitalize. Inspire.');
        \App\Models\Setting::set('maintenance_mode', '0');

        // ---- Demo accounts (password: "password") ----
        $learner = User::create([
            'name' => 'Juan Dela Cruz',
            'username' => 'juandelacruz',
            'email' => 'juan@example.com',
            'password' => Hash::make('password'),
            'role' => 'learner',
            'bio' => 'Passionate about learning and preserving the Bagobo Tagabawa language and culture.',
            'location' => 'Davao Oriental, Philippines',
            'email_verified_at' => now(),
            'created_at' => Carbon::parse('2025-05-10'),
        ]);

        $admin = User::create([
            'name' => 'Maria Santos',
            'username' => 'admin.maria',
            'email' => 'maria@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'location' => 'Davao City, Philippines',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'super@example.com',
            'password' => Hash::make('password'),
            'role' => 'super',
            'email_verified_at' => now(),
        ]);

        // ---- Learning modules + quizzes + learner progress ----
        // Quiz questions are grounded in facts stated in the study (the Bagobo of
        // Mindanao near Mount Apo) and in the platform's own seeded vocabulary
        // (Salamat = thank you, Epanaw = journey, Kasili = friend) — no invented
        // dialect data. `answer` is the index of the correct option.
        $moduleData = [
            [
                'title' => 'Introduction to Bagobo Tagabawa Culture',
                'module' => 'Culture', 'difficulty' => 'Beginner', 'progress' => 75,
                'content' => "The Bagobo are one of the indigenous peoples of southern Mindanao, living around the Davao Gulf and the slopes of Mount Apo. The Tagabawa are one of the Bagobo subgroups, alongside the Clata (Guiangan) and the Ubo.\n\nTheir heritage is carried through oral tradition, weaving, music, and ritual. This lesson introduces who the Bagobo Tagabawa are and why preserving their dialect and customs matters in a modernizing world.",
                'questions' => [
                    ['question' => 'The Bagobo people traditionally live near which mountain?', 'options' => ['Mount Mayon', 'Mount Apo', 'Mount Pulag', 'Mount Pinatubo'], 'answer' => 1],
                    ['question' => 'The Bagobo Tagabawa are an indigenous group from which island group?', 'options' => ['Luzon', 'Visayas', 'Mindanao', 'Palawan'], 'answer' => 2],
                    ['question' => 'Which of the following is a Bagobo subgroup?', 'options' => ['Ilocano', 'Tagabawa', 'Waray', 'Kapampangan'], 'answer' => 1],
                ],
            ],
            [
                'title' => 'Basic Bagobo Tagabawa Vocabulary',
                'module' => 'Language', 'difficulty' => 'Beginner', 'progress' => 60,
                'content' => "Start building your Bagobo Tagabawa vocabulary with a few everyday words from the platform's dictionary:\n\n• Salamat — thank you\n• Epanaw — journey\n• Kasili — friend\n\nReview these in the Vocabulary Dictionary, then take the quiz below.",
                'questions' => [
                    ['question' => 'What does the word "Salamat" mean?', 'options' => ['Friend', 'Thank you', 'Water', 'Journey'], 'answer' => 1],
                    ['question' => 'The platform is named EPANAW. What does "Epanaw" mean?', 'options' => ['Journey', 'Mountain', 'Song', 'Elder'], 'answer' => 0],
                    ['question' => 'What does "Kasili" mean?', 'options' => ['Water', 'Thank you', 'Friend', 'House'], 'answer' => 2],
                ],
            ],
            [
                'title' => 'Traditional Practices and Beliefs',
                'module' => 'Culture', 'difficulty' => 'Intermediate', 'progress' => 40,
                'content' => "Bagobo life is woven together by ritual, thanksgiving, and respect for the land. Ceremonies mark the harvest and important moments in community life, and knowledge is passed from elders to the young.\n\nThis lesson explores how traditions are transmitted across generations and why community participation is central to keeping them alive.",
                'questions' => [
                    ['question' => 'How is Bagobo cultural knowledge most traditionally passed down?', 'options' => ['Printed textbooks', 'Oral tradition from elders', 'Television', 'Government memos'], 'answer' => 1],
                    ['question' => 'Who are considered the primary custodians of Bagobo cultural knowledge?', 'options' => ['Tourists', 'Elders', 'Foreign researchers', 'App developers'], 'answer' => 1],
                ],
            ],
            [
                'title' => 'Greetings and Common Phrases',
                'module' => 'Language', 'difficulty' => 'Beginner', 'progress' => 100,
                'content' => "Greetings open the door to any language. In Bagobo Tagabawa, showing gratitude and warmth toward others is an important part of daily interaction.\n\nUse this lesson to practice expressing thanks and addressing a friend, then confirm what you have learned in the quiz.",
                'questions' => [
                    ['question' => 'How would you express gratitude in Bagobo Tagabawa?', 'options' => ['Epanaw', 'Salamat', 'Kasili', 'Wayig'], 'answer' => 1],
                    ['question' => 'Which word would you use to refer to a friend?', 'options' => ['Kasili', 'Salamat', 'Epanaw', 'Apo'], 'answer' => 0],
                ],
            ],
            [
                'title' => 'Bagobo Weaving Technique',
                'module' => 'Culture', 'difficulty' => 'Intermediate', 'progress' => 20,
                'content' => "Weaving is one of the most recognizable expressions of Bagobo artistry. Traditional textiles carry geometric patterns and meanings tied to identity and community.\n\nThis lesson looks at weaving as both a craft and a form of cultural memory worth preserving and revitalizing.",
                'questions' => [
                    ['question' => 'In Bagobo culture, traditional weaving is best described as:', 'options' => ['A purely modern hobby', 'A craft that also carries cultural identity', 'An imported industrial process', 'Unrelated to heritage'], 'answer' => 1],
                    ['question' => 'Why is documenting weaving patterns important for the community?', 'options' => ['To preserve cultural memory for future generations', 'To replace the patterns entirely', 'To keep them secret from the community', 'It has no real purpose'], 'answer' => 0],
                ],
            ],
        ];

        $modules = collect($moduleData)->map(function ($m) use ($learner) {
            $module = LearningModule::create([
                'title' => $m['title'],
                'description' => 'A guided lesson in the EPANAW BAGOBO learning path.',
                'category' => 'Culture',
                'module' => $m['module'],
                'difficulty' => $m['difficulty'],
                'content' => $m['content'],
                'image' => '/heritage-hero.jpg',
            ]);

            $module->users()->attach($learner->id, [
                'progress' => $m['progress'],
                'completed_at' => $m['progress'] === 100 ? now() : null,
            ]);

            foreach ($m['questions'] as $i => $q) {
                QuizQuestion::create([
                    'learning_module_id' => $module->id,
                    'question' => $q['question'],
                    'options' => $q['options'],
                    'answer' => $q['answer'],
                    'order' => $i,
                ]);
            }

            // The completed module gets a passing quiz result on record.
            if ($m['progress'] === 100) {
                QuizResult::create([
                    'user_id' => $learner->id,
                    'learning_module_id' => $module->id,
                    'score' => count($m['questions']),
                    'total' => count($m['questions']),
                    'remarks' => 'Passed',
                ]);
            }

            return $module;
        });

        // ---- Vocabulary + Pronunciation Library ----
        // Entries with a phonetic pronunciation are sourced from the capstone's
        // own data (Table 11). Words without a paper-verified pronunciation keep
        // it null rather than inventing one; `example` is an English usage note.
        $vocab = [
            ['word' => 'Genda', 'meaning' => 'where', 'pronunciation' => 'Ge-n-da', 'category' => 'Greeting', 'example' => null, 'speaker' => 'Elder Rosa'],
            ['word' => 'Salamat', 'meaning' => 'thank you', 'pronunciation' => 'sa-la-mat', 'category' => 'Expression', 'example' => 'Said to express gratitude after receiving help or a gift.', 'speaker' => 'Elder Juan'],
            ['word' => 'Wayig', 'meaning' => 'water', 'pronunciation' => 'Wa-y-ig', 'category' => 'Noun', 'example' => null, 'speaker' => 'Elder Rosa'],
            ['word' => 'Apo', 'meaning' => 'grandparent', 'pronunciation' => 'a-po', 'category' => 'Family', 'example' => null, 'speaker' => 'Elder Lina'],
            ['word' => 'Epanaw', 'meaning' => 'journey', 'pronunciation' => null, 'category' => 'Noun', 'example' => 'The platform is named EPANAW — a journey toward preserving Bagobo Tagabawa heritage.', 'speaker' => null],
            ['word' => 'Kasili', 'meaning' => 'friend', 'pronunciation' => null, 'category' => 'Noun', 'example' => 'Used to address a companion or peer.', 'speaker' => null],
        ];

        foreach ($vocab as $v) {
            $word = VocabularyWord::create([
                'word' => $v['word'],
                'meaning' => $v['meaning'],
                'pronunciation' => $v['pronunciation'],
                'category' => $v['category'],
                'example' => $v['example'],
            ]);

            // Only words with a verified phonetic guide get a Pronunciation Library
            // record. Audio files are left null until real recordings are added.
            if ($v['speaker']) {
                $word->pronunciationRecord()->create([
                    'audio_file' => null,
                    'native_speaker' => $v['speaker'],
                    'verified_by' => $admin->id,
                    'verified_at' => now(),
                ]);
            }
        }

        // ---- Multimedia gallery ----
        $media = [
            ['title' => 'Traditional Dance Performance', 'category' => 'Cultural Practice', 'media_type' => 'image', 'views' => 256, 'duration' => null, 'published_at' => '2025-05-20'],
            ['title' => 'Bagobo Village at the Foot of Mt. Apo', 'category' => 'Places', 'media_type' => 'image', 'views' => 312, 'duration' => null, 'published_at' => '2025-05-18'],
            ['title' => 'Traditional Handwoven Basket', 'category' => 'Crafts', 'media_type' => 'image', 'views' => 189, 'duration' => null, 'published_at' => '2025-05-16'],
            ['title' => "T'boli Ritual Ceremony", 'category' => 'Rituals', 'media_type' => 'video', 'views' => 420, 'duration' => '04:35', 'published_at' => '2025-05-15'],
            ['title' => 'Bamboo Flute Melody', 'category' => 'Traditional Music', 'media_type' => 'audio', 'views' => 178, 'duration' => '02:48', 'published_at' => '2025-05-14'],
            ['title' => "Traditional T'nalak Weaving", 'category' => 'Weaving', 'media_type' => 'image', 'views' => 231, 'duration' => null, 'published_at' => '2025-05-12'],
            ['title' => 'Elders Storytelling Session', 'category' => 'Stories & Legends', 'media_type' => 'video', 'views' => 305, 'duration' => '06:18', 'published_at' => '2025-05-10'],
            ['title' => 'Sounds of Nature in Bagobo Territory', 'category' => 'Nature Sounds', 'media_type' => 'audio', 'views' => 162, 'duration' => '03:26', 'published_at' => '2025-05-08'],
        ];
        foreach ($media as $m) {
            MediaItem::create(array_merge($m, ['thumbnail' => '/heritage-hero.jpg']));
        }

        // ---- Storytelling archive ----
        $stories = [
            ['title' => 'The Legend of Mount Apo', 'story_type' => 'Legend', 'author' => 'Elder Marco D.', 'views' => 542, 'read_time' => '8 min read', 'published_at' => '2025-05-17', 'summary' => 'Long ago, there was a great leader named Apo who watched over the people and the land. He was kind and strong, teaching his people how to live in harmony with nature. When he passed away, he turned into a mountain to continue protecting his people forever. That mountain is now called Mount Apo.', 'categories' => ['Legends', 'Origin', 'Nature']],
            ['title' => 'How the Bagobo People Came to Be', 'story_type' => 'Origin Story', 'author' => 'Maria Santos', 'views' => 428, 'read_time' => '6 min read', 'published_at' => '2025-05-14', 'summary' => 'The origin story of the Bagobo Tagabawa people and how they were guided to their homeland.', 'categories' => ['Origin']],
            ['title' => 'The Clever Mossy Deer', 'story_type' => 'Folktale', 'author' => 'Pedro Lumad', 'views' => 315, 'read_time' => '5 min read', 'published_at' => '2025-05-12', 'summary' => 'A folktale about the clever mossy deer who outwitted the hunter and saved the forest.', 'categories' => ['Folktale', 'Nature']],
            ['title' => 'Why Rivers Never Run Dry', 'story_type' => 'Myth', 'author' => 'Elder Aliguyon', 'views' => 287, 'read_time' => '4 min read', 'published_at' => '2025-05-10', 'summary' => 'A myth explaining why the rivers in our land never run dry, even during the hottest months.', 'categories' => ['Myth', 'Nature']],
        ];
        foreach ($stories as $s) {
            Story::create(array_merge($s, ['image' => '/heritage-hero.jpg']));
        }

        // ---- Repository items (cultural repository: text, image, audio, video) ----
        RepositoryItem::insert([
            ['title' => 'Bagobo Traditional Dance', 'category' => 'Cultural Practice', 'type' => 'Video', 'description' => 'A demonstration of a traditional Bagobo dance.', 'media' => '/heritage-hero.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Bagobo Greeting Words', 'category' => 'Language', 'type' => 'Audio', 'description' => 'Audio pronunciation of common Bagobo greetings.', 'media' => null, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Traditional Attire', 'category' => 'Images', 'type' => 'Image', 'description' => 'Photograph of traditional Bagobo clothing worn during rituals.', 'media' => '/heritage-hero.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'The Legend of Mount Apo', 'category' => 'Stories', 'type' => 'Text', 'description' => 'A traditional Bagobo folktale about the great mountain.', 'media' => null, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Bagobo Traditions', 'category' => 'Documents', 'type' => 'Text', 'description' => 'Reference document on Bagobo customs and traditions.', 'media' => null, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Traditional Weaving Patterns', 'category' => 'Handicrafts', 'type' => 'Image', 'description' => 'Close-up images of woven Bagobo textile patterns.', 'media' => '/heritage-hero.jpg', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ---- Contributions (admin moderation queue) ----
        Contribution::insert([
            ['user_id' => null, 'contributor_name' => 'Ana Reyes', 'item' => 'Bagobo weaving story', 'type' => 'Story', 'status' => 'Pending', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => null, 'contributor_name' => 'Mark Lim', 'item' => "Pronunciation audio: 'Salamat'", 'type' => 'Audio', 'status' => 'Pending', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => null, 'contributor_name' => 'Liza Cruz', 'item' => 'Traditional attire photo', 'type' => 'Image', 'status' => 'Approved', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => null, 'contributor_name' => 'Jose P.', 'item' => 'Folk tale transcript', 'type' => 'Text', 'status' => 'Pending', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ---- Events (upcoming + past, relative to the seed date) ----
        Event::insert([
            ['title' => 'Weaving Demonstration', 'starts_at' => now()->subMonth()->setTime(13, 0), 'location' => 'Barangay Kinuskusan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Cultural Storytelling Session', 'starts_at' => now()->addWeeks(2)->setTime(14, 0), 'location' => 'Community Hall, Bansalan', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Bagobo Tagabawa Language Workshop', 'starts_at' => now()->addMonth()->setTime(10, 0), 'location' => 'Learning Center', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Gin-Em Harvest Festival', 'starts_at' => now()->addMonths(2)->setTime(9, 0), 'location' => 'Bansalan Municipal Plaza', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ---- Feedback ----
        Feedback::create([
            'user_id' => $learner->id,
            'subject' => 'Great platform',
            'body' => 'Love the learning modules and the cultural repository!',
            'status' => 'Open',
        ]);

        // ---- Announcements ----
        Announcement::insert([
            ['title' => 'Welcome to EPANAW BAGOBO!', 'body' => 'Explore, learn, and contribute to preserve our heritage.', 'author' => 'EPANAW Team', 'published_at' => '2025-05-18', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Scheduled Maintenance', 'body' => 'The system will undergo maintenance on May 25, 2025 from 12:00 AM to 3:00 AM.', 'author' => 'Super Admin', 'published_at' => '2025-05-20', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ---- Achievements (earned by learner) ----
        $achievements = [
            ['name' => 'Dedicated Learner', 'description' => 'Complete 10 learning modules', 'icon' => 'book-open', 'earned_at' => '2025-05-15'],
            ['name' => 'Active Contributor', 'description' => 'Make 5 community contributions', 'icon' => 'message-square', 'earned_at' => '2025-05-20'],
            ['name' => 'Culture Explorer', 'description' => 'Explore 20 repository items', 'icon' => 'star', 'earned_at' => '2025-05-25'],
        ];
        foreach ($achievements as $a) {
            $achievement = Achievement::create(['name' => $a['name'], 'description' => $a['description'], 'icon' => $a['icon']]);
            $achievement->users()->attach($learner->id, ['earned_at' => $a['earned_at']]);
        }

        // ---- System activity logs (super admin) ----
        ActivityLog::insert([
            ['actor' => 'admin.maria', 'action' => 'User admin.maria updated learning material', 'icon' => 'book-open', 'occurred_at' => '2025-05-20 10:45:00', 'created_at' => now(), 'updated_at' => now()],
            ['actor' => 'system', 'action' => 'New user registered: juandelacruz@example.com', 'icon' => 'users', 'occurred_at' => '2025-05-20 09:30:00', 'created_at' => now(), 'updated_at' => now()],
            ['actor' => 'system', 'action' => 'Database backup completed successfully', 'icon' => 'database', 'occurred_at' => '2025-05-20 02:00:00', 'created_at' => now(), 'updated_at' => now()],
            ['actor' => 'superadmin', 'action' => 'System login: Super Admin', 'icon' => 'shield-check', 'occurred_at' => '2025-05-19 23:15:00', 'created_at' => now(), 'updated_at' => now()],
        ]);

        unset($modules);
    }
}
