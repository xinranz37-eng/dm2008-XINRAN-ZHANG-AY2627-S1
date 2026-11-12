# Pudding Squishy — Final Project Reflection

Our project, Pudding Squishy, is a digital squishy toy shaped like a pudding. We wanted to create a playful experience that feels soft and satisfying, even though the user is interacting with a screen. The pudding also reacts like a small character, encouraging users to explore how gently or roughly they treat it.

The project uses mouse and touch input. Clicking or tapping starts an interaction, holding increases pressure, and dragging stretches the pudding in different directions. When released, it bounces back and plays a squish sound if sound is enabled. Stronger interactions can leave bruises or damage the chocolate topping, while quick taps create playful reactions.

The code is organised around a main PuddingToy class, which manages movement, pressure, appearance and interaction history. Separate MiniSquishy, Crumb and ExplosionPiece classes handle smaller objects and particles. Arrays keep track of these objects and remove them when their animations finish.

The experience changes through repeated interaction. From 15 squishes in a cycle, mini puddings split off and the main pudding becomes smaller. The minis eventually melt, and the main pudding can recover after a period of inactivity. At 100 total squishes, it explodes and displays an ending screen with a restart button.

We use warm yellow and chocolate colours, rounded shapes, changing facial expressions and squishy sounds to support the toy-like feeling. The white background keeps attention on the character.

One important technical challenge is coordinating these behaviours without conflicting states. The current code separates normal interaction, explosion and the ending screen, while recovery checks both inactivity and remaining minis. This structure makes the transitions clearer and keeps the final screen visible until the user restarts.
