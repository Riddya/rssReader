<?php

namespace RSS\ReaderBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\DateTime;
use RSS\ReaderBundle\Entity\Tags;
use RSS\ReaderBundle\Form\TagsType;

class DefaultController extends Controller
{
    /**
     * @Route("/", name = "home")
     * @Template()
     */
    public function indexAction()
    {
        return array();
    }

    /**
     * @Route("/about", name = "about")
     * @Template
     */
    public  function aboutAction() {
        return array();
    }

    /**
     * @Route("/rss/content/{id}", name = "show_single_rss")
     * @Template
     */
    public function rssContentAction($id) {
        $response = new Response();
        $em = $this->getDoctrine()->getManager();
        $stack = array();
        $entity = $em->getRepository('RSSReaderBundle:Rss')->find($id);
        $tags = $em->getRepository('RSSReaderBundle:Tags')->findByIdRss($entity);
        foreach ($tags as $tag) {
            array_push($stack,$tag->getTag());
        }
        $rss = simplexml_load_file($entity->getUrl());
        foreach ($rss->xpath("//channel/item/category") as $category) {
            $category = trim($category);
            $temp = explode(',',$category);
            foreach ($temp as $cat) {
                $cat = trim($cat);
                if (!in_array($cat,$stack)) {
                    $tag = new Tags();
                    $tag->setTag($cat);
                    $tag->setIdRss($entity);
                    $em->persist($tag);
                }
                array_push($stack,$cat);
            }
        }
        $em->flush();
        $response->isCacheable(true);
        $response->setPublic();
        //$date = new \DateTime();
        //$date->modify('+180 seconds');
        $response = $this->render('RSSReaderBundle:Default:rssContent.html.twig',array('rss' => $rss))->setMaxAge(180);
        return $response;
    }


    function tagFontSize($num) {
        $size = 9;
        if ($num == 1) $size = 10;
        elseif ($num == 2) $size = 12;
        elseif ($num == 3) $size = 14;
        elseif ($num == 4) $size = 16;
        elseif ($num == 5) $size = 18;
        elseif ($num == 6) $size = 20;
        elseif ($num == 7) $size = 22;
        elseif ($num == 8) $size = 24;
        elseif ($num == 9) $size = 26;
        else $size = 28;
        return $size;
    }

    /**
     * @Route("/cloud", name = "tags_cloud")
     * @Template()
     */
    public function cloudAction() {
        $i = 0;
        $output = array();
        $repository = $this->getDoctrine()
            ->getRepository('RSSReaderBundle:Tags');
        $query = $repository->createQueryBuilder('p')
            ->select('DISTINCT p.tag as tags, COUNT(p.tag) as col')
            ->orderBy('col','DESC')
            ->groupBy('tags')
            ->setMaxResults($this->container->getParameter('tagsCount'))
            ->getQuery();
        $entity = $query->getResult();
        foreach ($entity as $tag) {
            $output[$i]['tag'] = $tag['tags'];
            $output[$i]['size'] = self::tagFontSize($tag['col']);
            $i++;
        }
        shuffle($output);
        return $this->render('RSSReaderBundle:Default:cloud.html.twig', array('tags' => $output));
    }

    /**
     * @Route("/rss/tag/{name}", name = "show_tag_rss")
     * @Template
     */
    public function rssTagAction($name) {
        $response = new Response();
        $response->isCacheable(true);
        $response->setPublic();
        $stack = array();
        $list = array();
        $feeds = array();
        $em = $this->getDoctrine()->getManager();
        $entity = $em->getRepository('RSSReaderBundle:Tags')->findByTag($name);
        foreach ($entity as $tag) {
            if (!in_array($tag->getIdRss(),$list)) {
                array_push($list,$tag->getIdRss());
            }
        }
        foreach ($list as $rss_id) {
            $entity = $em->getRepository('RSSReaderBundle:Rss')->find($rss_id);
            array_push($feeds,$entity);
        }
        foreach ($feeds as $entity) {
            $rss = simplexml_load_file($entity->getUrl());
            array_push($stack, $rss);
        }
        $response = $this->render('RSSReaderBundle:Default:rssTag.html.twig',array('stack' => $stack))->setMaxAge(180);
        return $response;
    }


    /**
     * @Route("/rss/common", name = "show_common_rss")
     * @Template
     */
    public function rssCommonAction($name = null) {
        $stack = array();
        if ($name != null) {
            $list = array();
            $feeds = array();
            $em = $this->getDoctrine()->getManager();
            $entity = $em->getRepository('RSSReaderBundle:Tags')->findByTag($name);
            foreach ($entity as $tag) {
                if (!in_array($tag->getIdRss(),$list)) {
                    array_push($list,$tag->getIdRss);
                }
            }
            foreach ($list as $rss_id) {
                $entity = $em->getRepository('RSSReaderBundle:Rss')->find($rss_id);
                array_push($feeds,$entity);
            }
            foreach ($feeds as $entity) {
                $rss = simplexml_load_file($entity->getUrl());
                array_push($stack, $rss);
            }
            return array('stack' => $stack);
        } else {
            $repository = $this->getDoctrine()
                ->getRepository('RSSReaderBundle:Rss');
            $query = $repository->createQueryBuilder('p')
                ->setMaxResults(3)
                ->getQuery();
            $entities = $query->getResult();
            shuffle($entities);
            foreach ($entities as $entity) {
                $rss = simplexml_load_file($entity->getUrl());
                array_push($stack, $rss);
            }
            return array('stack' => $stack);
            /*$stack = array();
            $em = $this->getDoctrine()->getManager();
            $entities = $em->getRepository('RSSReaderBundle:Rss')->findAll();
            foreach ($entities as $entity) {
                $rss = simplexml_load_file($entity->getUrl());
                array_push($stack, $rss);
            }
            return array('stack' => $stack);*/
        }
    }
}
