import unittest

from backend.app.services.character_voice import (
    assign_character_profiles,
    VOICE_PROFILES,
)


class CharacterVoiceProfileTest(unittest.TestCase):

    def test_distinct_characters_get_distinct_profiles(self):
        names = ["Naruto", "Sasuke", "Sakura", "Kakashi"]

        profiles = assign_character_profiles(names)

        assigned = [
            tuple(sorted(profiles[name.casefold()].items()))
            for name in names
        ]

        self.assertEqual(len(set(assigned)), len(names))

    def test_same_character_keeps_one_profile(self):
        profiles = assign_character_profiles(
            ["Naruto", "  naruto  ", "NARUTO"]
        )

        self.assertEqual(len(profiles), 1)

    def test_profiles_wrap_when_more_characters_than_profiles(self):
        names = [f"Char{i}" for i in range(len(VOICE_PROFILES) + 2)]

        profiles = assign_character_profiles(names)

        self.assertEqual(len(profiles), len(names))


class ServiceImportTest(unittest.TestCase):

    def test_voice_generator_imports(self):
        from backend.app.services import voice_generator
        self.assertTrue(hasattr(voice_generator, "generate_voice"))

    def test_dubbing_generator_imports(self):
        from backend.app.services import dubbing_generator
        self.assertTrue(
            hasattr(dubbing_generator, "generate_hindi_dubbing")
        )


if __name__ == "__main__":
    unittest.main()
