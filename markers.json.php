 < ? p h p 
 
 $ i m a g e s   =   u n s e r i a l i z e ( f i l e _ g e t _ c o n t e n t s ( ' i m a g e s 2 . d a t ' ) ) ; 
 
 $ m a r k e r s   =   a r r a y ( ) ; 
 
 f o r e a c h ( $ i m a g e s   a s   $ i m a g e )   { 
         
         i f ( i s s e t ( $ i m a g e [ ' l a t i t u d e ' ] )   & &   i s s e t ( $ i m a g e [ ' l o n g i t u d e ' ] ) )   { 
 
                 $ p a t h   =   ' i c o n s / ' . $ i m a g e [ ' t h u m b _ i d ' ] . ' . p n g ' ; 
         
                 i f ( f i l e _ e x i s t s ( $ p a t h ) )   { 
                         $ m   =   a r r a y ( 
                                 ' l a t '   = >   $ i m a g e [ ' l a t i t u d e ' ] , 
                                 ' l n g '   = >   $ i m a g e [ ' l o n g i t u d e ' ] , 
                                 ' d a t a '   = >   a r r a y ( ' i d '   = >   $ i m a g e [ ' t h u m b _ i d ' ] ,   ' c a p t i o n '   = >   $ i m a g e [ ' y e a r ' ] . '   -   ' . $ i m a g e [ ' c a p t i o n ' ] ) 
                         ) ; 
                 
                         $ m a r k e r s [ ]   =   $ m ; 
                 }                 
         } 
 } 
 
 i f ( i s _ w r i t a b l e ( ' m a r k e r s . j s o n ' )   { 
         f i l e _ p u t _ c o n t e n t s ( $ m a r k e r s ,   ' m a r k e r s . j s o n ' ) ; 
 } 
 
 h e a d e r ( ' C o n t e n t - T y p e :   a p p l i c a t i o n / j s o n ' ) ; 
 
 e c h o   j s o n _ e n c o d e ( $ m a r k e r s ) ; 
 
 ? >